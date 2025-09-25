import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Music, Play, LogOut, User, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard({ onSelectRepertorio }) {
  const { user, logout } = useAuth();
  const [repertorios, setRepertorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newRepertorio, setNewRepertorio] = useState({
    nome: '',
    descricao: ''
  });

  // Carregar repertórios do usuário
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'repertorios'),
      where('ownerId', '==', user.uid),
      orderBy('dataCriacao', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repertoriosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRepertorios(repertoriosData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreateRepertorio = async (e) => {
    e.preventDefault();
    
    if (!newRepertorio.nome.trim()) return;

    try {
      await addDoc(collection(db, 'repertorios'), {
        nome: newRepertorio.nome,
        descricao: newRepertorio.descricao,
        ownerId: user.uid,
        dataCriacao: new Date().toISOString()
      });

      setNewRepertorio({ nome: '', descricao: '' });
      setShowNewDialog(false);
    } catch (error) {
      console.error('Erro ao criar repertório:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <Music className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Repertório Fácil</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {user?.displayName || user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user?.displayName || 'Músico'}!
          </h2>
          <p className="text-gray-600">
            Organize seus repertórios e tenha tudo na ponta dos dedos durante suas apresentações.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Seus Repertórios</h3>
          
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Repertório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Repertório</DialogTitle>
                <DialogDescription>
                  Crie um novo repertório para organizar suas músicas.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRepertorio} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Repertório</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Show de Sábado"
                    value={newRepertorio.nome}
                    onChange={(e) => setNewRepertorio({...newRepertorio, nome: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Ex: Repertório para o show no Bar do Zé"
                    value={newRepertorio.descricao}
                    onChange={(e) => setNewRepertorio({...newRepertorio, descricao: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Repertório
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Repertórios Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando repertórios...</p>
          </div>
        ) : repertorios.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum repertório ainda</h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro repertório para começar a organizar suas músicas.
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Repertório
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repertorios.map((repertorio) => (
              <Card key={repertorio.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{repertorio.nome}</span>
                    <Music className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </CardTitle>
                  {repertorio.descricao && (
                    <CardDescription className="line-clamp-2">
                      {repertorio.descricao}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(repertorio.dataCriacao)}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onSelectRepertorio(repertorio)}
                      className="ml-2"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

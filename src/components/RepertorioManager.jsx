import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Play, GripVertical, Music } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function RepertorioManager({ repertorio, onBack, onStartLiveMode }) {
  const [musicas, setMusicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMusica, setEditingMusica] = useState(null);
  const [newMusica, setNewMusica] = useState({
    titulo: '',
    artista: '',
    tonalidade: '',
    acordes: '',
    observacoes: ''
  });

  const tonalidades = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
  ];

  // Carregar músicas do repertório
  useEffect(() => {
    if (!repertorio) return;

    const q = query(
      collection(db, 'repertorios', repertorio.id, 'musicas'),
      orderBy('ordem', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const musicasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMusicas(musicasData);
      setLoading(false);
    });

    return unsubscribe;
  }, [repertorio]);

  const handleCreateMusica = async (e) => {
    e.preventDefault();
    
    if (!newMusica.titulo.trim()) return;

    try {
      await addDoc(collection(db, 'repertorios', repertorio.id, 'musicas'), {
        ...newMusica,
        ordem: musicas.length
      });

      setNewMusica({
        titulo: '',
        artista: '',
        tonalidade: '',
        acordes: '',
        observacoes: ''
      });
      setShowNewDialog(false);
    } catch (error) {
      console.error('Erro ao criar música:', error);
    }
  };

  const handleEditMusica = async (e) => {
    e.preventDefault();
    
    if (!editingMusica || !editingMusica.titulo.trim()) return;

    try {
      await updateDoc(doc(db, 'repertorios', repertorio.id, 'musicas', editingMusica.id), {
        titulo: editingMusica.titulo,
        artista: editingMusica.artista,
        tonalidade: editingMusica.tonalidade,
        acordes: editingMusica.acordes,
        observacoes: editingMusica.observacoes
      });

      setEditingMusica(null);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Erro ao editar música:', error);
    }
  };

  const handleDeleteMusica = async (musicaId) => {
    if (!confirm('Tem certeza que deseja excluir esta música?')) return;

    try {
      await deleteDoc(doc(db, 'repertorios', repertorio.id, 'musicas', musicaId));
    } catch (error) {
      console.error('Erro ao excluir música:', error);
    }
  };

  const openEditDialog = (musica) => {
    setEditingMusica({ ...musica });
    setShowEditDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{repertorio.nome}</h1>
                {repertorio.descricao && (
                  <p className="text-sm text-gray-600">{repertorio.descricao}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {musicas.length > 0 && (
                <Button onClick={() => onStartLiveMode(repertorio, musicas)}>
                  <Play className="h-4 w-4 mr-2" />
                  Modo Ao Vivo
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Músicas ({musicas.length})
          </h3>
          
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Música
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Música</DialogTitle>
                <DialogDescription>
                  Adicione uma nova música ao repertório "{repertorio.nome}".
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMusica} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Música</Label>
                    <Input
                      id="titulo"
                      placeholder="Ex: Imagine"
                      value={newMusica.titulo}
                      onChange={(e) => setNewMusica({...newMusica, titulo: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artista">Artista</Label>
                    <Input
                      id="artista"
                      placeholder="Ex: John Lennon"
                      value={newMusica.artista}
                      onChange={(e) => setNewMusica({...newMusica, artista: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tonalidade">Tonalidade</Label>
                  <Select value={newMusica.tonalidade} onValueChange={(value) => setNewMusica({...newMusica, tonalidade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a tonalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {tonalidades.map((tom) => (
                        <SelectItem key={tom} value={tom}>{tom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="acordes">Acordes e Letra</Label>
                  <Textarea
                    id="acordes"
                    placeholder="Ex:&#10;(Intro) C Am F G&#10;&#10;(Verso 1)&#10;C                Am&#10;Imagine there's no heaven&#10;F                G&#10;It's easy if you try..."
                    value={newMusica.acordes}
                    onChange={(e) => setNewMusica({...newMusica, acordes: e.target.value})}
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Ex: Começa com o riff de guitarra, final em fade out..."
                    value={newMusica.observacoes}
                    onChange={(e) => setNewMusica({...newMusica, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Adicionar Música
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Músicas List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando músicas...</p>
          </div>
        ) : musicas.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma música ainda</h3>
            <p className="text-gray-600 mb-4">
              Adicione sua primeira música para começar a montar o repertório.
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Música
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {musicas.map((musica, index) => (
              <Card key={musica.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{musica.titulo}</CardTitle>
                        <CardDescription>
                          {musica.artista && `${musica.artista} • `}
                          {musica.tonalidade && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {musica.tonalidade}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(musica)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteMusica(musica.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {(musica.acordes || musica.observacoes) && (
                  <CardContent className="pt-0">
                    {musica.acordes && (
                      <div className="mb-3">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                          {musica.acordes}
                        </pre>
                      </div>
                    )}
                    {musica.observacoes && (
                      <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-200">
                        <strong>Observações:</strong> {musica.observacoes}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Música</DialogTitle>
              <DialogDescription>
                Edite as informações da música.
              </DialogDescription>
            </DialogHeader>
            {editingMusica && (
              <form onSubmit={handleEditMusica} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-titulo">Título da Música</Label>
                    <Input
                      id="edit-titulo"
                      value={editingMusica.titulo}
                      onChange={(e) => setEditingMusica({...editingMusica, titulo: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-artista">Artista</Label>
                    <Input
                      id="edit-artista"
                      value={editingMusica.artista}
                      onChange={(e) => setEditingMusica({...editingMusica, artista: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-tonalidade">Tonalidade</Label>
                  <Select value={editingMusica.tonalidade} onValueChange={(value) => setEditingMusica({...editingMusica, tonalidade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a tonalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {tonalidades.map((tom) => (
                        <SelectItem key={tom} value={tom}>{tom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-acordes">Acordes e Letra</Label>
                  <Textarea
                    id="edit-acordes"
                    value={editingMusica.acordes}
                    onChange={(e) => setEditingMusica({...editingMusica, acordes: e.target.value})}
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-observacoes">Observações</Label>
                  <Textarea
                    id="edit-observacoes"
                    value={editingMusica.observacoes}
                    onChange={(e) => setEditingMusica({...editingMusica, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, User, Users, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const MonteSuaBanda = ({ onBack }) => {
  const { user } = useAuth();
  const [bandId, setBandId] = useState(null);
  const [bandName, setBandName] = useState('');
  const [initialBandName, setInitialBandName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [integrantes, setIntegrantes] = useState([]);
  const [showNewIntegranteDialog, setShowNewIntegranteDialog] = useState(false);
  const [showDeleteIntegranteDialog, setShowDeleteIntegranteDialog] = useState(false);
  const [showDeleteBandDialog, setShowDeleteBandDialog] = useState(false);
  const [integranteToDelete, setIntegranteToDelete] = useState(null);
  const [newIntegrante, setNewIntegrante] = useState({ nome: '', instrumento: '' });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { data: bandData, error: bandError } = await supabase
      .from('banda')
      .select('id, nome')
      .eq('owner_id', user.id)
      .single();

    if (bandData) {
      setBandId(bandData.id);
      setBandName(bandData.nome);
      setInitialBandName(bandData.nome);

      const { data: integrantesData, error: integrantesError } = await supabase
        .from('integrantes')
        .select('*')
        .eq('banda_id', bandData.id)
        .order('created_at', { ascending: true });

      if (integrantesError) {
        alert('Erro ao carregar integrantes: ' + integrantesError.message);
      } else {
        setIntegrantes(integrantesData || []);
      }
    } else if (bandError && bandError.code !== 'PGRST116') {
      alert('Erro ao carregar banda: ' + bandError.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const channel = supabase
        .channel(`public:banda:owner_id=eq.${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'banda' }, fetchData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'integrantes' }, fetchData)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleSaveBand = async () => {
    if (!bandName.trim()) {
      alert('Por favor, dê um nome para a sua banda.');
      return;
    }
    setIsSaving(true);

    const bandDataObject = {
      owner_id: user.id,
      nome: bandName,
    };

    let response;
    if (bandId) {
      response = await supabase.from('banda').update(bandDataObject).eq('id', bandId).select().single();
    } else {
      response = await supabase.from('banda').insert(bandDataObject).select().single();
    }

    const { data, error } = response;

    if (error) {
      console.error('Erro ao salvar banda:', error);
      alert('Erro ao salvar banda: ' + error.message);
    } else if (data) {
      setBandId(data.id);
      setInitialBandName(data.nome);
    }
    setIsSaving(false);
  };

  const handleDeleteBand = async () => {
    setIsSaving(true);
    const { error: integrantesError } = await supabase.from('integrantes').delete().eq('banda_id', bandId);
    if (integrantesError) {
      alert('Erro ao excluir integrantes: ' + integrantesError.message);
      setIsSaving(false);
      return;
    }
    
    const { error: bandError } = await supabase.from('banda').delete().eq('id', bandId);
    if (bandError) {
      alert('Erro ao excluir banda: ' + bandError.message);
    } else {
      setBandId(null);
      setBandName('');
      setInitialBandName('');
      setIntegrantes([]);
      setShowDeleteBandDialog(false);
    }
    setIsSaving(false);
  };

  const handleCreateIntegrante = async (e) => {
    e.preventDefault();
    if (!newIntegrante.nome.trim() || !newIntegrante.instrumento.trim() || !bandId) return;
    const { error } = await supabase.from('integrantes').insert([{ ...newIntegrante, owner_id: user.id, banda_id: bandId }]);
    if (error) alert('Erro ao criar integrante: ' + error.message);
    else {
      setNewIntegrante({ nome: '', instrumento: '' });
      setShowNewIntegranteDialog(false);
    }
  };

  const handleDeleteIntegrante = async () => {
    if (!integranteToDelete) return;
    const { error } = await supabase.from('integrantes').delete().eq('id', integranteToDelete);
    if (error) alert('Erro ao excluir integrante: ' + error.message);
    else {
      setIntegranteToDelete(null);
      setShowDeleteIntegranteDialog(false);
    }
  };

  const renderCreateBand = () => (
    <main className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader><CardTitle className="text-center">Monte sua Banda</CardTitle><CardDescription className="text-center">Dê um nome para sua banda para começar.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="band-name">Nome da Banda</Label><Input id="band-name" placeholder="Ex: The Rolling Stones" value={bandName} onChange={(e) => setBandName(e.target.value)} /></div>
          <Button onClick={handleSaveBand} disabled={isSaving || !bandName.trim()} className="w-full">{isSaving ? 'Criando...' : 'Criar Banda'}</Button>
        </CardContent>
      </Card>
    </main>
  );

  const renderBandManager = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-6"><CardHeader><CardTitle>Nome da Banda</CardTitle></CardHeader><CardContent className="flex flex-col sm:flex-row gap-2">
        <Input value={bandName} onChange={(e) => setBandName(e.target.value)} disabled={isSaving} />
        <Button onClick={handleSaveBand} disabled={isSaving || bandName === initialBandName}><Save className="h-4 w-4 mr-2" />{isSaving ? 'Salvando...' : 'Salvar'}</Button>
        <Button variant="destructive" onClick={() => setShowDeleteBandDialog(true)} disabled={isSaving}><Trash2 className="h-4 w-4 mr-2" />Excluir Banda</Button>
      </CardContent></Card>
      
      {integrantes.length === 0 ? (
        <div className="text-center py-12"><Users className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum integrante cadastrado</h3><p className="text-gray-600 mb-4">Comece adicionando os membros da sua banda.</p><Button onClick={() => setShowNewIntegranteDialog(true)}><Plus className="h-4 w-4 mr-2" />Adicionar Primeiro Integrante</Button></div>
      ) : (
        <div className="space-y-4">{integrantes.map((integrante) => (
          <Card key={integrante.id}><CardContent className="flex items-center justify-between p-4"><div className="flex items-center"><div className="p-2 bg-gray-100 rounded-full mr-4"><User className="h-6 w-6 text-gray-700" /></div><div><p className="font-semibold text-gray-800">{integrante.nome}</p><p className="text-sm text-gray-600">{integrante.instrumento}</p></div></div><Button variant="ghost" size="icon" onClick={() => {setIntegranteToDelete(integrante.id); setShowDeleteIntegranteDialog(true);}}><Trash2 className="h-5 w-5 text-red-500" /></Button></CardContent></Card>
        ))}
        </div>
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between items-center h-16"><div className="flex items-center"><Button variant="ghost" size="icon" onClick={onBack} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-xl font-semibold text-gray-900">Monte sua Banda</h1></div>{bandId && <Button onClick={() => setShowNewIntegranteDialog(true)}><Plus className="h-4 w-4 mr-2" />Adicionar Integrante</Button>}</div></div></header>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="text-gray-600 mt-2">Carregando...</p></div>
      ) : bandId ? renderBandManager() : renderCreateBand()}

      <Dialog open={showNewIntegranteDialog} onOpenChange={setShowNewIntegranteDialog}><DialogContent><DialogHeader><DialogTitle>Adicionar Novo Integrante</DialogTitle><DialogDescription>Insira os dados do novo membro da banda.</DialogDescription></DialogHeader><form onSubmit={handleCreateIntegrante} className="space-y-4"><div className="space-y-2"><Label htmlFor="nome-integrante">Nome</Label><Input id="nome-integrante" value={newIntegrante.nome} onChange={(e) => setNewIntegrante({ ...newIntegrante, nome: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="instrumento">Instrumento</Label><Input id="instrumento" value={newIntegrante.instrumento} onChange={(e) => setNewIntegrante({ ...newIntegrante, instrumento: e.target.value })} required /></div><div className="flex justify-end space-x-2 pt-2"><Button type="button" variant="outline" onClick={() => setShowNewIntegranteDialog(false)}>Cancelar</Button><Button type="submit">Adicionar</Button></div></form></DialogContent></Dialog>
      <Dialog open={showDeleteIntegranteDialog} onOpenChange={setShowDeleteIntegranteDialog}><DialogContent><DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle><DialogDescription>Tem certeza que deseja excluir este integrante?</DialogDescription></DialogHeader><div className="flex justify-end space-x-2 pt-4"><Button variant="outline" onClick={() => setShowDeleteIntegranteDialog(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDeleteIntegrante}>Excluir</Button></div></DialogContent></Dialog>
      <Dialog open={showDeleteBandDialog} onOpenChange={setShowDeleteBandDialog}><DialogContent><DialogHeader><DialogTitle>Confirmar Exclusão da Banda</DialogTitle><DialogDescription>Tem certeza que deseja excluir a banda? Todos os integrantes também serão removidos. Esta ação não pode ser desfeita.</DialogDescription></DialogHeader><div className="flex justify-end space-x-2 pt-4"><Button variant="outline" onClick={() => setShowDeleteBandDialog(false)} disabled={isSaving}>Cancelar</Button><Button variant="destructive" onClick={handleDeleteBand} disabled={isSaving}>{isSaving ? 'Excluindo...' : 'Excluir Permanentemente'}</Button></div></DialogContent></Dialog>
    </div>
  );
};

export default MonteSuaBanda;

import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import RepertorioManager from './components/RepertorioManager';
import LiveMode from './components/LiveMode';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRepertorio, setSelectedRepertorio] = useState(null);
  const [liveMusicas, setLiveMusicas] = useState([]);

  const handleSelectRepertorio = (repertorio) => {
    setSelectedRepertorio(repertorio);
    setCurrentView('repertorio');
  };

  const handleBackToDashboard = () => {
    setSelectedRepertorio(null);
    setCurrentView('dashboard');
  };

  const handleStartLiveMode = (repertorio, musicas) => {
    setSelectedRepertorio(repertorio);
    setLiveMusicas(musicas);
    setCurrentView('live');
  };

  const handleBackFromLive = () => {
    setCurrentView('repertorio');
    setLiveMusicas([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  switch (currentView) {
    case 'repertorio':
      return (
        <RepertorioManager
          repertorio={selectedRepertorio}
          onBack={handleBackToDashboard}
          onStartLiveMode={handleStartLiveMode}
        />
      );
    case 'live':
      return (
        <LiveMode
          repertorio={selectedRepertorio}
          musicas={liveMusicas}
          onBack={handleBackFromLive}
        />
      );
    default:
      return (
        <Dashboard onSelectRepertorio={handleSelectRepertorio} />
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

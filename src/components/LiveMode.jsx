import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

export default function LiveMode({ repertorio, musicas, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState([50]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef(null);
  const intervalRef = useRef(null);

  const currentMusica = musicas[currentIndex];

  // Auto scroll functionality
  useEffect(() => {
    if (isAutoScrolling && contentRef.current) {
      const scrollStep = scrollSpeed[0] / 10; // Convert percentage to pixels per interval
      
      intervalRef.current = setInterval(() => {
        setScrollPosition(prev => {
          const newPosition = prev + scrollStep;
          const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;
          
          if (newPosition >= maxScroll) {
            setIsAutoScrolling(false);
            return maxScroll;
          }
          
          return newPosition;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Update scroll position
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Reset scroll when changing songs
  useEffect(() => {
    setScrollPosition(0);
    setIsAutoScrolling(false);
  }, [currentIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < musicas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  const resetScroll = () => {
    setScrollPosition(0);
    setIsAutoScrolling(false);
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case ' ':
        e.preventDefault();
        toggleAutoScroll();
        break;
      case 'r':
        resetScroll();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isAutoScrolling]);

  if (!currentMusica) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Nenhuma música encontrada</h2>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sair do Modo Ao Vivo
            </Button>
            <div className="text-sm text-gray-400">
              {repertorio.nome}
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {currentIndex + 1} de {musicas.length}
          </div>
        </div>
      </header>

      {/* Song Info */}
      <div className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{currentMusica.titulo}</h1>
              <div className="flex items-center space-x-4 text-gray-300">
                {currentMusica.artista && (
                  <span className="text-lg">{currentMusica.artista}</span>
                )}
                {currentMusica.tonalidade && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Tom: {currentMusica.tonalidade}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {currentMusica.observacoes && (
            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                <strong>Observações:</strong> {currentMusica.observacoes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Song Content */}
          <div 
            ref={contentRef}
            className="bg-gray-900 rounded-lg p-8 mb-6 min-h-[60vh] max-h-[60vh] overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            {currentMusica.acordes ? (
              <pre className="text-lg leading-relaxed font-mono text-gray-100 whitespace-pre-wrap">
                {currentMusica.acordes}
              </pre>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">Nenhum conteúdo disponível para esta música</p>
                <p className="text-sm mt-2">Adicione acordes e letras no modo de edição</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-center">Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Scroll Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={toggleAutoScroll}
                    variant={isAutoScrolling ? "default" : "outline"}
                    size="lg"
                    className="min-w-[120px]"
                  >
                    {isAutoScrolling ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Auto Scroll
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetScroll}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Velocidade do Scroll</span>
                    <span>{scrollSpeed[0]}%</span>
                  </div>
                  <Slider
                    value={scrollSpeed}
                    onValueChange={setScrollSpeed}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <Button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Música</div>
                  <div className="text-lg font-semibold text-white">
                    {currentIndex + 1} / {musicas.length}
                  </div>
                </div>

                <Button
                  onClick={goToNext}
                  disabled={currentIndex === musicas.length - 1}
                  variant="outline"
                  size="lg"
                  className="min-w-[120px]"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-700">
                <p>Atalhos: ← Anterior | → Próxima | Espaço Play/Pause | R Resetar</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

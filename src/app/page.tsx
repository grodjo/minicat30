'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export const Home = () => {
  const [pseudo, setPseudo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Éviter les erreurs d'hydratation en attendant le montage côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShowModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) return;
    setShowStartModal(true);
  };

  const handleStartGame = async () => {
    setShowStartModal(false);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo: pseudo.trim() }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        
        // Arrêter le loading et déclencher l'animation de sortie
        setIsLoading(false);
        setIsExiting(true);
        
        // Attendre la fin de l'animation avant de naviguer
        setTimeout(() => {
          router.push(`/quiz/${sessionId}`);
        }, 800);
      } else {
        const errorData = await response.json();
        setIsLoading(false);
        
        // Afficher l'erreur avec un toast
        if (response.status === 409) {
          toast.error(errorData.error || 'Déjà pris ! Creusez vous le ciboulot !');
        } else {
          toast.error(errorData.error || 'Erreur lors de la création de la session');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      toast.error('Erreur lors de la création de la session');
    }
  };

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grille futuriste en arrière-plan - plus visible */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:60px_60px] opacity-60"></div>

      {/* Bouton classement en haut à droite */}
      <div className="absolute top-8 right-4 z-20 pt-4">
        <button
          onClick={goToScoreboard}
          className="text-violet-200 hover:text-white text-sm font-medium flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-violet-300/20 hover:bg-white/10 transition-all duration-200"
        >
          🏆 Classement
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <div className="relative z-10 text-center space-y-12 max-w-2xl w-full">
        {/* Titre principal avec sous-titre */}
        <div className={`space-y-4 ${isExiting ? 'animate-exit-title-up' : ''}`}>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight animate-title-shine drop-shadow-2xl font-sans filter brightness-110">
            MINICAT 30
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full shadow-lg shadow-violet-400/50"></div>
          
          {/* Phrase descriptive stylisée */}
          <p className="text-lg md:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300 leading-relaxed tracking-wide italic drop-shadow-lg">
            Un jeu de piste à travers mes quartiers iconiques de Paris
          </p>
          
          {/* Signature style enluminures */}
          <div className="mt-3">
            <p className="text-base font-serif font-semibold text-yellow-300/90 tracking-widest drop-shadow-md" 
               style={{ 
                 fontFamily: 'Georgia, "Times New Roman", serif',
                 textShadow: '0 0 10px rgba(253, 224, 71, 0.3), 1px 1px 2px rgba(0, 0, 0, 0.5)'
               }}>
              ✦ by Célia with ❤️ ✦
            </p>
          </div>
        </div>

        {/* Interface de connexion - design moderne */}
        {!isMounted ? (
          // Placeholder pendant l'hydratation pour éviter le flash
          <div className="space-y-8 opacity-50">
            <div className="space-y-6">
              <div className="relative">
                <div className="relative group">
                  <div className="w-full bg-transparent border-0 border-b-2 border-violet-300/40 text-white text-xl font-medium text-center py-4 px-2 h-14"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 w-0"></div>
                </div>
              </div>
            </div>
            <div className="w-full h-14 bg-gradient-to-r from-slate-600 to-slate-600 text-slate-300 rounded-2xl"></div>
          </div>
        ) : (
          <form onSubmit={handleShowModal} className={`space-y-8 ${isExiting ? 'animate-exit-content-down' : ''}`}>
            <div className="space-y-6">
              <div className="relative">
                {/* Input moderne avec ligne */}
                <div className="relative group">
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    required
                    maxLength={50}
                    disabled={isLoading || isExiting}
                    className="w-full bg-transparent border-0 border-b-2 border-violet-300/40 text-white text-xl font-medium text-center py-4 px-2 focus:outline-none focus:border-violet-400 transition-all duration-300 placeholder:text-violet-300/50"
                    placeholder="Choisissez un nom d'équipe"
                  />
                  
                  {/* Ligne animée au focus */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 transition-all duration-300 w-0 group-focus-within:w-3/4"></div>
                </div>
              </div>
            </div>

            {/* Bouton classique "Je veux jouer !" */}
            <Button
              type="submit"
              disabled={!pseudo.trim() || isLoading || isExiting}
              className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg tracking-wide transition-all duration-300 shadow-xl hover:shadow-2xl disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300 rounded-2xl"
            >
              {isLoading ? 'Chargement...' : isExiting ? 'Connexion...' : 'On est chaud patate 🔥🥔'}
            </Button>
          </form>
        )}

        {/* Modale de confirmation */}
        <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 border-violet-300/30 text-white max-w-lg w-full min-h-[50vh] flex flex-col justify-between">
            <DialogHeader className="space-y-6 pt-8">
              <DialogTitle className="text-3xl md:text-4xl font-bold text-center text-violet-200">
                Bienvenue équipe {pseudo}&nbsp;!
              </DialogTitle>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full"></div>
              <DialogDescription className="text-violet-200/80 text-center text-lg md:text-xl leading-relaxed px-6">
                Ce bouton vous donnera accès à la première étape et déclenchera le chronomètre
              </DialogDescription>
            </DialogHeader>
            
            {/* Bouton START rond dans la modale - centré verticalement */}
            <div className="flex justify-center items-center flex-1 py-8">
              <button
                onClick={handleStartGame}
                disabled={isLoading}
                className={`relative w-40 h-40 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 active:translate-y-1 group cursor-pointer`}
                style={{
                  background: 'linear-gradient(145deg, #8b5cf6, #7c3aed, #6366f1)',
                  boxShadow: '12px 12px 24px rgba(30, 27, 75, 0.6), -6px -6px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                {/* Cercle intérieur avec effet de brillance */}
                <div className="absolute inset-3 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                
                {/* Contenu du bouton */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                  <div className="text-4xl mb-2">🦆</div>
                  <div className="text-sm font-bold text-center leading-tight">
                    {isLoading ? 'GO!' : 'START'}
                  </div>
                </div>
                
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;

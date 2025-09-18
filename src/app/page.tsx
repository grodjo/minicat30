'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { playEventSound, EventSound } from '@/lib/sounds';

const Home = () => {
  const [pseudo, setPseudo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Éviter les erreurs d'hydratation en attendant le montage côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShowModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) return;
    
    // Jouer le son ps2Login au clic du bouton "Go!" - maintenant instantané par défaut
    playEventSound(EventSound.buttonClick);
    
    try {
      // Vérifier s'il y a une session active avant d'ouvrir la modale
      const response = await fetch('/api/check-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo: pseudo.trim() }),
      });

      if (response.ok) {
        const { hasActiveSession: hasActive } = await response.json();
        setHasActiveSession(hasActive);
        setShowStartModal(true);
      } else {
        toast.error('Erreur lors de la vérification');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      toast.error('Erreur de connexion');
    }
  };

  const handleStartGame = async () => {
    // Jouer le son dbzTeleportation au clic du bouton start - maintenant instantané par défaut
    playEventSound(EventSound.startGame);
    
    setShowStartModal(false);
    
    // Déclencher l'animation de sortie immédiatement à la fermeture de la modale
    setIsExiting(true);
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
        setIsLoading(false);
        
        // Attendre la fin de l'animation avant de naviguer (animation déjà en cours)
        setTimeout(() => {
          router.push(`/quiz/${sessionId}`);
        }, 600); // Réduit de 800ms à 600ms car l'animation a déjà commencé
      } else {
        const errorData = await response.json();
        setIsLoading(false);
        setIsExiting(false); // Arrêter l'animation en cas d'erreur
        
        // Afficher l'erreur avec un toast
        toast.error(errorData.error || 'Erreur lors de la création de la session');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setIsExiting(false); // Arrêter l'animation en cas d'erreur
      toast.error('Erreur lors de la création de la session');
    }
  };

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

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
                {/* Input moderne avec ligne et bouton à droite */}
                <div className="flex items-center gap-4">
                  <div className="relative group flex-1">
                    <input
                      type="text"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                      disabled={isLoading || isExiting}
                      className="w-full bg-transparent border-0 border-b-2 border-violet-300/40 text-white text-xl font-bold text-center py-4 px-2 focus:outline-none focus:border-violet-400 transition-all duration-300 placeholder:text-violet-300/50 placeholder:text-lg tracking-wide font-mono"
                      placeholder="Votre nom d'équipe"
                      style={{
                        textShadow: '0 0 10px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)',
                        letterSpacing: '0.1em'
                      }}
                    />
                    
                    {/* Ligne animée au focus */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 transition-all duration-300 w-0 group-focus-within:w-3/4 shadow-lg shadow-violet-400/50 pointer-events-none"></div>
                    
                    {/* Effet de brillance subtil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded pointer-events-none"></div>
                  </div>

                  {/* Bouton carré à droite */}
                  <Button
                    type="submit"
                    disabled={!pseudo.trim() || pseudo.trim().length < 1 || isLoading || isExiting}
                    className="w-16 h-16 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300 flex items-center justify-center p-0 hover:scale-105 active:scale-95"
                  >
                    {isLoading ? '⏳' : 'Go!'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Modale de confirmation */}
        <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 border-violet-300/30 text-white max-w-lg w-full min-h-[50vh] flex flex-col justify-between">
            <DialogHeader className="space-y-6 pt-8">
              <DialogTitle className="text-3xl md:text-4xl font-bold text-center text-violet-200">
                {hasActiveSession ? `Ravie de vous revoir l'équipe ${pseudo} !` : `Bienvenue l'équipe ${pseudo} !`}
              </DialogTitle>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full"></div>
              <DialogDescription className="text-violet-200/80 text-center text-lg md:text-xl leading-relaxed px-6">
                {hasActiveSession 
                  ? "Vous avez une partie en cours. Vous allez reprendre là où vous en étiez."
                  : "Ce bouton vous donnera accès à la première étape et déclenchera le chronomètre"
                }
              </DialogDescription>
            </DialogHeader>
            
            {/* Bouton classique en bas de la modale */}
            <div className="pb-8 px-6">
              <Button
                onClick={handleStartGame}
                disabled={isLoading}
                className="w-full h-16 text-lg font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 border-0 rounded-2xl shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                {isLoading ? 'Chargement...' : (hasActiveSession ? 'Reprendre' : 'Démarrer')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;

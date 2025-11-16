import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { playSound, SoundName } from '@/lib/sounds';

interface HintsProps {
  sessionId: string;
  totalHints: number;
  currentHintIndex: number;
  onHintUsed: (newHintIndex: number) => void; // Callback pour mettre à jour l'état parent
  onPenaltyAnimationTrigger?: (minutes: number) => void; // Callback pour déclencher l'animation de pénalité
  onPenaltiesReload?: () => Promise<void>; // Callback pour recharger les pénalités depuis la BDD
  className?: string;
}

interface HintData {
  hint: string;
  hintIndex: number;
}

export const Hints: React.FC<HintsProps> = ({
  sessionId,
  totalHints,
  currentHintIndex,
  onHintUsed,
  onPenaltyAnimationTrigger,
  onPenaltiesReload,
  className = ""
}) => {
  const [currentHint, setCurrentHint] = useState<HintData | null>(null);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const quizToastClass = "transform -translate-y-22";

  const getHint = async (hintIndex: number): Promise<void> => {
    setIsLoadingHint(true);
    
    try {
      // Si l'indice est déjà débloqué, utiliser l'API de récupération
      if (hintIndex < currentHintIndex) {
        const response = await fetch(`/api/session/${sessionId}/hint/${hintIndex}`);
        const data = await response.json();
        
        if (response.ok) {
          setCurrentHint(data);
          setHintModalOpen(true);
          // Jouer le son de révélation d'indice pour les indices déjà débloqués
          playSound(SoundName.PS2_REVEAL);
        } else {
          toast.error(data.error, {
            className: quizToastClass
          });
        }
      } else {
        // Pour un nouvel indice : jouer le son et déclencher l'animation immédiatement
        playSound(SoundName.DUCK);
        onPenaltyAnimationTrigger?.(3); // Déclencher l'animation de pénalité de 3 minutes
        onHintUsed(hintIndex + 1);
        
        // Récupérer l'indice en arrière-plan pendant que l'animation se joue
        const response = await fetch(`/api/session/${sessionId}/hint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          // Recharger les pénalités depuis la BDD après l'appel API
          await onPenaltiesReload?.();
          
          // Attendre que l'animation de pénalité se termine avant d'ouvrir la modale
          setTimeout(() => {
            setCurrentHint(data);
            setHintModalOpen(true);
            // Jouer le son de révélation une fois l'indice chargé et la modale ouverte
            playSound(SoundName.PS2_REVEAL);
          }, 500); //  500ms pour laisser l'animation de pénalité se terminer
        } else {
          toast.error(data.error, {
            className: quizToastClass
          });
        }
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error('Erreur lors de la récupération de l\'indice', {
        className: quizToastClass
      });
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleHintClick = (hintIndex: number) => {
    getHint(hintIndex);
  };

  if (totalHints === 0) {
    return null;
  }

  return (
    <>
      {/* Section des boutons d'indices */}
      <div className={`text-center mb-8 ${className}`}>
        <div className="flex flex-wrap justify-center gap-3">
          {/* Créer un bouton pour chaque indice possible */}
          {Array.from({ length: totalHints }, (_, index) => {
            const hintIndex = index;
            const isUnlocked = hintIndex < currentHintIndex; // Indice débloqué si < currentHintIndex
            const isAvailable = hintIndex === currentHintIndex; // Prochain indice disponible
            const isLocked = hintIndex > currentHintIndex; // Indices futurs verrouillés

            let disabled = false;

            if (isLocked) {
              disabled = true;
            }

            return (
              <Button
                key={hintIndex}
                onClick={() => handleHintClick(hintIndex)}
                disabled={disabled || isLoadingHint}
                className={`
                  ${isUnlocked
                    ? 'bg-green-600 hover:bg-green-500 text-white border-green-500 shadow-green-500/30' 
                    : isAvailable
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500 shadow-yellow-500/30'
                      : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                  } 
                  disabled:opacity-50 min-w-[100px] font-semibold text-sm px-3 py-2 rounded-lg shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 border-2 transform hover:-translate-y-0.5
                `}
              >
                {isLoadingHint && hintIndex === currentHintIndex ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isUnlocked ? '🔓' : isAvailable ? '💡' : '🔒'} Indice {hintIndex + 1}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Modale d'affichage de l'indice */}
      <Dialog open={hintModalOpen} onOpenChange={setHintModalOpen}>
        <DialogContent className="bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-300 border border-amber-300/50 shadow-2xl max-w-lg">
          <DialogHeader className="space-y-6 pt-8">
            <DialogTitle className="text-3xl md:text-4xl font-bold text-center text-amber-800 drop-shadow-sm">
              💡 Indice
            </DialogTitle>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent mx-auto rounded-full"></div>
            <div className="text-amber-900 text-center text-lg md:text-xl leading-relaxed px-6 font-medium whitespace-pre-line">
              {currentHint?.hint || "Aucun indice disponible"}
            </div>
          </DialogHeader>
          
          {/* Bouton de fermeture centré */}
          <div className="flex justify-center pb-8 pt-4">
            <Button 
              onClick={() => setHintModalOpen(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
            >
               Hin hin !
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTimer } from '@/hooks/use-timer';
import confetti from 'canvas-confetti';

interface Step {
  stepName: string;
  currentSubStep: string;
  subStepData: {
    type: string;
    question?: string;
    content?: string;
    hint?: string;
    buttonText?: string;
    requiresAnswer?: boolean;
    singleAttempt?: boolean;
  };
  stepSession: {
    directionCompleted: boolean;
    enigmaCompleted: boolean;
    bonusCompleted: boolean;
    bonusCorrect: boolean;
    keyCompleted: boolean;
  };
  pseudo?: string | null;
  startedAt: string;
}

interface Hint {
  hint: string;
  hintIndex: number;
  totalHints: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [step, setStep] = useState<Step | null>(null);
  const [answer, setAnswer] = useState('');
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isStepEntering, setIsStepEntering] = useState(false);

  // Hook pour le timer
  const elapsedTime = useTimer(step?.startedAt || null);

  // Classe Tailwind pour les toasts de la page quiz - positionnés au-dessus du footer
  const quizToastClass = "transform -translate-y-22";

  // Ouvrir la modale quand un nouvel indice est chargé
  useEffect(() => {
    if (isLoadingHint && hints.length > 0 && currentHintIndex !== null) {
      setHintModalOpen(true);
      setIsLoadingHint(false);
    }
  }, [hints, isLoadingHint, currentHintIndex]);

  const loadCurrentStep = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/current-step`);
      const data = await response.json();

      if (data.completed) {
        setCompleted(true);
      } else {
        setStep(data);
        setHints([]);
        setAnswer('');
        
        // Déclencher l'animation d'entrée
        setIsStepEntering(true);
        setTimeout(() => setIsStepEntering(false), 600); // Animation de 600ms
      }
    } catch (error) {
      console.error('Error loading step:', error);
      toast.error('Erreur lors du chargement de l\'étape', {
        className: quizToastClass
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    loadCurrentStep();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step) return;

    // Pour les sous-étapes qui ne nécessitent pas de réponse (direction, key)
    if (!step.subStepData.requiresAnswer) {
      setSubmitting(true);
      try {
        const response = await fetch(`/api/session/${sessionId}/complete-substep`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stepName: step.stepName,
            subStepType: step.currentSubStep,
            data: step.subStepData.type === 'key' ? { key: 'found' } : {}
          }),
        });

        if (response.ok) {
          // Charger la prochaine sous-étape
          await loadCurrentStep();
        } else {
          const data = await response.json();
          toast.error(data.error, { className: quizToastClass });
        }
      } catch (error) {
        console.error('Error completing substep:', error);
        toast.error('Erreur lors de la validation', { className: quizToastClass });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Pour les énigmes et bonus qui nécessitent une réponse
    if (!answer.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName: step.stepName,
          answer: answer.trim(),
          subStepType: step.currentSubStep,
        }),
      });

      const data = await response.json();
      
      if (data.isCorrect) {
        // Début de la transition - masquer immédiatement l'ancienne question
        setIsCorrectAnswer(true);
        setIsTransitioning(true);
        
        // Explosion centrale réaliste avec plus de confettis
        const fireExplosion = () => {
          // Explosion principale avec effet de burst
          confetti({
            particleCount: 200,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            ticks: 100,
            gravity: 1.2,
            scalar: 1.4,
            startVelocity: 45
          });
        };

        fireExplosion();
        
        // Charger la nouvelle question en arrière-plan pendant les confettis
        setTimeout(async () => {
          if (data.completed) {
            setCompleted(true);
          } else {
            // Charger la nouvelle étape avant de la montrer
            await loadCurrentStep();
          }
          // Finir la transition
          setIsCorrectAnswer(false);
          setIsTransitioning(false);
        }, 2000); // 2 secondes pour les confettis
      } else {
        toast.error(data.message, {
          className: quizToastClass
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Erreur lors de la soumission de la réponse', {
        className: quizToastClass
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = async (hintIndex: number) => {
    if (!step) return;

    // Si l'indice est déjà chargé, juste ouvrir la modale
    if (hints[hintIndex]) {
      setCurrentHintIndex(hintIndex);
      setHintModalOpen(true);
      return;
    }

    // Sinon, charger l'indice
    setIsLoadingHint(true);
    setCurrentHintIndex(hintIndex);
    try {
      const response = await fetch(`/api/session/${sessionId}/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName: step.stepName,
          hintIndex: hints.length,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setHints([...hints, data]);
        // La modale s'ouvrira automatiquement via useEffect
      } else {
        setIsLoadingHint(false);
        setCurrentHintIndex(null);
        toast.error(data.error, {
          className: quizToastClass
        });
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setIsLoadingHint(false);
      setCurrentHintIndex(null);
      toast.error('Erreur lors de la récupération de l\'indice', {
        className: quizToastClass
      });
    }
  };

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-violet-100">Chargement...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-8xl mb-8 animate-bounce">🎉</div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
          Félicitations !
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8 rounded-full"></div>
        <p className="text-violet-200 mb-12 text-xl md:text-2xl font-light max-w-2xl leading-relaxed">
          Vous avez terminé le quiz avec brio !
        </p>
        <Button
          onClick={goToScoreboard}
          className="h-14 px-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-xl rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-violet-500/50"
        >
          <span className="mr-1 text-2xl">🏆</span>
          Voir le classement
          
        </Button>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erreur
          </h1>
          <p className="text-gray-600">
            Impossible de charger l&apos;étape
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 relative overflow-hidden">
      {/* Header avec pseudo et timer */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="text-violet-200 text-sm font-semibold bg-white/10 backdrop-blur-md px-3 py-2 rounded-full">
            👤 {step.pseudo ? step.pseudo : `Session ${sessionId.slice(-8)}`}
          </div>
          <div className="text-yellow-300 text-sm font-semibold bg-yellow-400/10 backdrop-blur-md px-3 py-2 rounded-full border border-yellow-400/30">
            ⏱️ {elapsedTime}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="min-h-screen flex flex-col pt-20 pb-32 px-4">
        <div className="flex-1 flex items-center justify-center">
          <div className={`w-full max-w-2xl transition-all duration-300 ${
            isCorrectAnswer || isTransitioning ? 'animate-question-vanish' : 
            isStepEntering ? 'animate-question-bounce-in' : 
            'opacity-100 transform translate-y-0'
          }`}>
            {/* Étape avec style Minicat30 mais plus petit */}
            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-violet-200/90 tracking-wider mb-3">
                {step.stepName}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto"></div>
            </div>

            {/* Direction pour se rendre au lieu */}
            {step.subStepData.type === 'direction' && (
              <div className="text-center mb-6">
                <p className="text-violet-300 text-lg italic">
                  📍 {step.subStepData.content}
                </p>
              </div>
            )}

            {/* Affichage adaptatif selon le type de sous-étape */}
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed">
              {step.subStepData.type === 'direction' ? step.subStepData.content :
               step.subStepData.type === 'key' ? step.subStepData.content :
               step.subStepData.question}
            </h1>

            {/* Bouton d'indice unique - seulement pour les énigmes */}
            {step.subStepData.type === 'enigma' && (
              <div className="text-center mb-8">
                <div className="flex justify-center">
                  <Dialog 
                    open={hintModalOpen} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setHintModalOpen(false);
                        setCurrentHintIndex(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => getHint(0)}
                        disabled={isLoadingHint || isCorrectAnswer}
                        variant="outline"
                        className={`
                          ${hints.length > 0
                            ? 'bg-green-500/20 border-green-400/50 text-green-200 hover:bg-green-400/30 hover:text-green-100' 
                            : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200 hover:bg-yellow-400/30 hover:text-yellow-100'
                          } 
                          disabled:opacity-50 min-w-[120px] font-semibold
                        `}
                      >
                        {isLoadingHint ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <>
                            {hints.length > 0 ? '✅' : '💡'} Indice
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-yellow-50 border-yellow-200">
                      <DialogHeader>
                        <DialogTitle className="text-yellow-800">💡 Indice</DialogTitle>
                        <DialogDescription className="text-yellow-700 text-base font-medium">
                          {hints.find(h => h.hintIndex === 0)?.hint || step.subStepData.hint}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone de saisie fixée en bas - adaptée selon le type de sous-étape */}
        <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-violet-200/50 shadow-2xl p-4 transition-all duration-500 ${
          isCorrectAnswer ? 'transform translate-y-full opacity-0' : 
          isStepEntering ? 'animate-input-slide-up' : ''
        }`}>
          {step.subStepData.requiresAnswer ? (
            // Formulaire pour les énigmes et bonus
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex-1 h-14 bg-white border-violet-300/50 text-slate-900 placeholder:text-violet-600/60 text-lg font-medium focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-xl"
                  placeholder="Votre réponse..."
                  required
                  disabled={submitting || isCorrectAnswer}
                />
                <Button
                  type="submit"
                  disabled={!answer.trim() || submitting || isCorrectAnswer}
                  className="h-14 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <span className="text-xl">➤</span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            // Bouton simple pour direction et key
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                disabled={submitting || isCorrectAnswer}
                className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  step.subStepData.buttonText || 'Continuer'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

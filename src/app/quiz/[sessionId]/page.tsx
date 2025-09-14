'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTimer } from '@/hooks/use-timer';
import confetti from 'canvas-confetti';
import { playEventSound, EventSound } from '@/lib/sounds';

// Composants
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { LoadingState, CompletedState, ErrorState } from '@/components/quiz/QuizStates';
import { DirectionSubStep } from '@/components/substeps/DirectionSubStep';
import { MovingSubStep } from '@/components/substeps/MovingSubStep';
import { EnigmaSubStep } from '@/components/substeps/EnigmaSubStep';
import { BonusSubStep } from '@/components/substeps/BonusSubStep';
import { KeySubStep } from '@/components/substeps/KeySubStep';
import { FinalSubStep } from '@/components/substeps/FinalSubStep';
import { Timer } from '@/components/ui/timer';
import { WrongAnswerToast, WrongAnswerToastRef } from '@/components/ui/wrong-answer-toast';

interface StepData {
  stepName: string;
  stepRank: number;
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
    hasUsedHint: boolean;
    enigmaAttemptsCount: number;
    penaltyTimeMs: number;
    currentHintIndex: number;
  };
  totalHints: number; // Ajouter le nombre total d'indices
}

interface SessionInfo {
  pseudo: string | null;
  startedAt: string;
}

const QuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [stepData, setStepData] = useState<StepData | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isStepEntering, setIsStepEntering] = useState(false);
  
  // État pour détecter les changements d'étape vs sous-étape
  const [previousStep, setPreviousStep] = useState<{stepName: string, currentSubStep: string} | null>(null);
  
  // État pour l'écran de transition des nouvelles étapes
  const [showStepTransition, setShowStepTransition] = useState(false);
  const [transitionStepName, setTransitionStepName] = useState<string>('');
  
  // Ref pour le toast d'erreur
  const wrongAnswerToastRef = useRef<WrongAnswerToastRef>(null);

  // Hook pour le timer
  const { formattedTime: elapsedTime, addTimePenalty, showPenaltyAnimation, lastPenaltyMinutes } = useTimer(sessionInfo?.startedAt || null);

  // Classe Tailwind pour les toasts de la page quiz - positionnés au-dessus du footer
  const quizToastClass = "transform -translate-y-22";

  const loadCurrentStep = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/current-step`);
      const data = await response.json();

      if (data.completed) {
        setCompleted(true);
      } else {
        // Séparer les données de session et d'étape
        const { pseudo, startedAt, ...stepData } = data;
        setSessionInfo({ pseudo, startedAt });
        
        // Détecter le type de changement
        const isNewStep = !previousStep || previousStep.stepName !== stepData.stepName;
        const isNewSubStep = previousStep && 
          previousStep.stepName === stepData.stepName && 
          previousStep.currentSubStep !== stepData.currentSubStep;
        
        setStepData(stepData);
        
        // Jouer le son approprié ou afficher l'écran de transition
        if (isNewStep) {
          // Nouvelle étape : afficher l'écran de transition avec le son marioKartGridIntro
          // Déterminer le nom à afficher selon si c'est l'étape finale ou non
          const transitionName = stepData.subStepData.type === 'final' 
            ? 'Étape finale' 
            : `Étape ${stepData.stepRank.toString().padStart(2, '0')}`;
          setTransitionStepName(transitionName);
          setShowStepTransition(true);
          playEventSound(EventSound.stepTransition); // marioKartGridIntro
          
          // Déclencher l'animation d'entrée de la sous-étape après 6 secondes (quand la transition se termine)
          setTimeout(() => {
            setShowStepTransition(false);
            setIsStepEntering(true);
            setTimeout(() => setIsStepEntering(false), 600); // Animation de 600ms
            // Jouer le son de sous-étape pour la première sous-étape
            playEventSound(EventSound.newSubStep);
          }, 6000);
        } else if (isNewSubStep) {
          // Nouvelle sous-étape dans la même étape : jouer le son ps2Expand
          playEventSound(EventSound.newSubStep);
        }
        
        // Mettre à jour l'étape précédente
        setPreviousStep({
          stepName: stepData.stepName,
          currentSubStep: stepData.currentSubStep
        });
        
        // Déclencher l'animation d'entrée seulement pour les nouvelles sous-étapes (pas les nouvelles étapes)
        if (isNewSubStep) {
          setIsStepEntering(true);
          setTimeout(() => setIsStepEntering(false), 600); // Animation de 600ms
        }
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

  // Gestion de la completion des sous-étapes sans réponse (direction, key)
  const handleSubStepComplete = async () => {
    if (!stepData) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/complete-substep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName: stepData.stepName,
          subStepType: stepData.currentSubStep,
          data: stepData.subStepData.type === 'key' ? { key: 'found' } : {}
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
      toast.error('Erreur lors de la validation', { 
        className: quizToastClass
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gestion de la soumission de réponse pour énigmes et bonus
  const handleAnswerSubmit = async (answer: string) => {
    if (!stepData) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName: stepData.stepName,
          answer: answer.trim(),
          subStepType: stepData.currentSubStep,
        }),
      });

      const data = await response.json();
      
      if (data.isCorrect) {
        // Jouer le son approprié selon le type de question
        if (stepData.subStepData.type === 'bonus') {
          playEventSound(EventSound.bonusSuccess); // dbzKiBlast pour bonus réussi
        } else if (stepData.subStepData.type === 'enigma' || stepData.subStepData.type === 'final') {
          playEventSound(EventSound.enigmaSuccess); // airHornWin pour énigme réussie
        } else if (stepData.subStepData.type === 'direction') {
          playEventSound(EventSound.directionComplete); // pokemonCaught pour direction réussie
        }
        
        // Début de la transition - masquer immédiatement l'ancienne question
        setIsCorrectAnswer(true);
        
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
        }, 2000); // 2 secondes pour les confettis
      } else {
        // Jouer le son approprié selon le type de question en cas d'erreur
        if (stepData.subStepData.type === 'bonus') {
          playEventSound(EventSound.bonusFailed); // dbzGhost pour bonus raté
        } else if (stepData.subStepData.type === 'enigma' || stepData.subStepData.type === 'final') {
          playEventSound(EventSound.enigmaFailed); // wrong3 pour énigme ratée
        } else if (stepData.subStepData.type === 'direction') {
          playEventSound(EventSound.enigmaFailed); // wrong3 pour direction ratée aussi
        }
        
        // Vérifier si c'est l'étape finale pour ajouter une pénalité
        if (stepData.subStepData.type === 'final') {
          addTimePenalty(1); // Ajouter 1 minute pour une mauvaise réponse finale
          wrongAnswerToastRef.current?.show();
          
          // Jouer le son approprié si spécifié
          if (data.playSound) {
            if (data.playSound === 'scratchStop') {
              playEventSound(EventSound.stop);
            } else if (data.playSound === 'alarmEnd') {
              playEventSound(EventSound.alarm);
            }
          }
          
          // Recharger les données pour mettre à jour le compteur de tentatives
          if (!data.moveToNext && !data.completed) {
            await loadCurrentStep();
          }
        } else if (stepData.subStepData.type === 'enigma') {
          // Pour les énigmes, la pénalité est déjà gérée côté serveur
          // On ajoute la pénalité côté client pour l'affichage immédiat
          addTimePenalty(1); // Ajouter 1 minute pour une mauvaise réponse énigme
          wrongAnswerToastRef.current?.show();
          
          // Jouer le son approprié si spécifié
          if (data.playSound) {
            if (data.playSound === 'scratchStop') {
              playEventSound(EventSound.stop);
            } else if (data.playSound === 'alarmEnd') {
              playEventSound(EventSound.alarm);
            }
          }
          
          // Vérifier si on doit passer à l'étape suivante (tentatives épuisées)
          if (data.moveToNext) {
            setTimeout(async () => {
              if (data.completed) {
                setCompleted(true);
              } else {
                await loadCurrentStep();
              }
            }, 1500);
          } else {
            // Recharger les données pour mettre à jour le compteur de tentatives
            await loadCurrentStep();
          }
        } else {
          // Vérifier si c'est un bonus raté qui doit passer à la suite
          if (data.moveToNext) {
            // Pour les bonus, utiliser le WrongAnswerToast au lieu du toast système
            wrongAnswerToastRef.current?.show();
            
            // Attendre que le toast disparaisse (3 secondes) puis charger la prochaine étape
            setTimeout(async () => {
              if (data.completed) {
                setCompleted(true);
              } else {
                await loadCurrentStep();
              }
            }, 1500); // 1.5 secondes pour laisser le toast disparaître
          } else {
            // Afficher notre toast custom pour mauvaise réponse (énigmes et directions)
            wrongAnswerToastRef.current?.show();
          }
        }
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

  // Callbacks pour le composant Hints
  const handleHintUsed = (newHintIndex: number) => {
    setStepData(prev => prev ? {
      ...prev,
      stepSession: {
        ...prev.stepSession,
        hasUsedHint: true,
        currentHintIndex: newHintIndex
      }
    } : null);
  };

  const handleTimePenalty = (minutes: number) => {
    addTimePenalty(minutes);
  };

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  // Rendu conditionnel selon l'état
  if (loading) {
    return <LoadingState />;
  }

  if (completed) {
    return <CompletedState onGoToScoreboard={goToScoreboard} />;
  }

  if (!stepData) {
    return <ErrorState />;
  }

  // Rendu du composant approprié selon le type de sous-étape
  const renderSubStep = () => {
    // Formatage du nom de l'étape - "Étape finale" pour l'étape finale, sinon numérotée
    const formattedStepName = stepData.subStepData.type === 'final' 
      ? 'Étape finale' 
      : `Étape ${stepData.stepRank.toString().padStart(2, '0')}`;
    
    const commonProps = {
      stepName: formattedStepName,
      isSubmitting: submitting,
      isCorrectAnswer,
      isStepEntering
    };

    switch (stepData.subStepData.type) {
      case 'direction':
        return (
          <DirectionSubStep
            {...commonProps}
            content={stepData.subStepData.content!}
            onSubmit={handleAnswerSubmit}
            totalHints={stepData.totalHints}
            currentHintIndex={stepData.stepSession.currentHintIndex}
            onHintUsed={handleHintUsed}
            onTimePenalty={handleTimePenalty}
            sessionId={sessionId}
          />
        );

      case 'moving':
        return (
          <MovingSubStep
            {...commonProps}
            text={stepData.subStepData.content!}
            onComplete={handleSubStepComplete}
          />
        );

      case 'enigma':
        return (
          <EnigmaSubStep
            {...commonProps}
            question={stepData.subStepData.question!}
            onSubmit={handleAnswerSubmit}
            totalHints={stepData.totalHints}
            currentHintIndex={stepData.stepSession.currentHintIndex}
            onHintUsed={handleHintUsed}
            onTimePenalty={handleTimePenalty}
            sessionId={sessionId}
            attemptsCount={stepData.stepSession.enigmaAttemptsCount}
            maxAttempts={10}
          />
        );

      case 'bonus':
        return (
          <BonusSubStep
            {...commonProps}
            question={stepData.subStepData.question!}
            onSubmit={handleAnswerSubmit}
          />
        );

      case 'key':
        return (
          <KeySubStep
            {...commonProps}
            content={stepData.subStepData.content!}
            buttonText={stepData.subStepData.buttonText!}
            onComplete={handleSubStepComplete}
          />
        );

      case 'final':
        return (
          <FinalSubStep
            {...commonProps}
            question={stepData.subStepData.question!}
            onSubmit={handleAnswerSubmit}
            attemptsCount={stepData.stepSession.enigmaAttemptsCount}
            maxAttempts={10}
          />
        );

      default:
        return <ErrorState message="Type de sous-étape non reconnu" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Header avec pseudo */}
      <QuizHeader 
        pseudo={sessionInfo?.pseudo || null} 
        sessionId={sessionId} 
      />

      {/* Timer positionné juste sous le header */}
      <div className="absolute top-20 left-0 right-0 z-10 text-center pt-4">
        <Timer 
          elapsedTime={elapsedTime}
          showPenaltyAnimation={showPenaltyAnimation}
          penaltyMinutes={lastPenaltyMinutes}
          size="large"
          className="justify-center"
        />
      </div>

      {/* Écran de transition pour les nouvelles étapes */}
      {showStepTransition && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="text-6xl animate-bounce">🚀</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide animate-pulse">
              C&apos;est parti pour
            </h1>
            <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 tracking-wider">
              {transitionStepName}
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="min-h-screen flex flex-col pt-32 pb-32 px-4">
        <div className="flex-1 flex items-center justify-center">
          {renderSubStep()}
        </div>
      </div>

      {/* Toast custom pour mauvaise réponse */}
      <WrongAnswerToast 
        ref={wrongAnswerToastRef}
        message={stepData.subStepData.type === 'bonus' ? "❌ C'est raté ! On enchâine !" : stepData.subStepData.type === 'final' ? "❌ Mauvaise réponse ! +1 minute !" : "❌ Nope !"}
      />
    </div>
  );
};

export default QuizPage;

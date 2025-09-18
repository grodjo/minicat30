'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTimer } from '@/hooks/use-timer';
import confetti from 'canvas-confetti';
import { playSound, SoundName } from '@/lib/sounds';
import { getStepCorrectAnswer } from '@/lib/steps';
import { formatScoreboardTime } from '@/lib/time-formatting';

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
  const [completedSessionData, setCompletedSessionData] = useState<{
    totalTime: string;
    effectiveTime: string;
    penaltyTime: string;
    bonusCorrect: number;
    bonusTotal: number;
  } | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isStepEntering, setIsStepEntering] = useState(false);
  
  // État pour détecter les changements d'étape vs sous-étape
  const [previousStep, setPreviousStep] = useState<{stepName: string, currentSubStep: string} | null>(null);
  
  // État pour l'écran de transition des nouvelles étapes
  const [showStepTransition, setShowStepTransition] = useState(false);
  const [transitionStepName, setTransitionStepName] = useState<string>('');
  
  // État pour les transitions de sous-étapes
  const [subStepTransition, setSubStepTransition] = useState<{
    show: boolean;
    message: string;
    success: boolean;
    fadeOut: boolean;
    correctAnswer?: string;
  }>({ show: false, message: '', success: true, fadeOut: false });
  
  // Ref pour le toast d'erreur
  const wrongAnswerToastRef = useRef<WrongAnswerToastRef>(null);

  // Hook pour le timer
  const { 
    formattedTime: elapsedTime, 
    showPenaltyAnimationOnly,
    reloadPenalties,
    showPenaltyAnimation, 
    lastPenaltyMinutes 
  } = useTimer(
    sessionInfo?.startedAt || null, 
    sessionId, 
    stepData?.stepName // Passer le stepName actuel
  );

  // Classe Tailwind pour les toasts de la page quiz - positionnés au-dessus du footer
  const quizToastClass = "transform -translate-y-22";

  const loadCurrentStep = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/current-step`);
      const data = await response.json();

      if (data.completed) {
        await loadCompletedSessionData();
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
            ? 'l\'Étape finale' 
            : `l\'Étape ${stepData.stepRank.toString().padStart(2, '0')}`;
          setTransitionStepName(transitionName);
          setShowStepTransition(true);
          playSound(SoundName.MARIO_KART_GRID_INTRO);
          
          // Déclencher l'animation d'entrée de la sous-étape après 6 secondes (quand la transition se termine)
          setTimeout(() => {
            setShowStepTransition(false);
            setIsStepEntering(true);
            setTimeout(() => setIsStepEntering(false), 600); // Animation de 600ms
            // Jouer le son de sous-étape pour la première sous-étape
            playSound(SoundName.PS2_EXPAND);
          }, 6000);
        } else if (isNewSubStep) {
          // Nouvelle sous-étape dans la même étape : jouer le son ps2Expand
          playSound(SoundName.PS2_EXPAND);
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

  // Fonction pour afficher la transition de sous-étape
  const showSubStepTransitionMessage = (success: boolean, subStepType: string, skipSound = false, correctAnswer?: string) => {
    const message = success ? 'Bien joué !' : 'Dommage !';
    setSubStepTransition({
      show: true,
      message,
      success,
      fadeOut: false,
      correctAnswer
    });
    
    // Jouer le son approprié seulement si pas déjà joué
    if (!skipSound) {
      if (success) {
        if (subStepType === 'enigma') {
          playSound(SoundName.DBZ_KI_BLAST);
        } else if (subStepType === 'bonus') {
          playSound(SoundName.AIR_HORN_WIN);
        } else {
          playSound(SoundName.POKEMON_CAUGHT);
        }
      }
      // Sons de mauvaise réponse retirés pour les transitions de substep
    }
    
    // Masquer la transition après 5 secondes avec fade-out progressif
    setTimeout(() => {
      // Commencer le fade-out
      setSubStepTransition(prev => ({ ...prev, fadeOut: true }));
      
      // Charger l'étape suivante après l'animation de fade-out
      setTimeout(async () => {
        await loadCurrentStep();
        // Réinitialiser complètement l'état après le chargement
        setSubStepTransition({ show: false, message: '', success: true, fadeOut: false });
      }, 500); // 500ms pour l'animation de fade-out
    }, 3000); // 3 secondes d'affichage
  };

  // Charger les données de session complétée pour l'écran de félicitations
  const loadCompletedSessionData = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/summary`);
      if (response.ok) {
        const data = await response.json();
        
        // Formater les données pour le composant CompletedState
        const formattedData = {
          totalTime: formatScoreboardTime(data.totalTimeMs),
          effectiveTime: formatScoreboardTime(data.effectiveTimeMs),
          penaltyTime: `${Math.round(data.penaltyTimeMs / (60 * 1000))}min`, // Conversion simple en minutes
          bonusCorrect: data.bonusStats.successCount,
          bonusTotal: data.bonusStats.totalCount
        };
        
        setCompletedSessionData(formattedData);
      }
    } catch (error) {
      console.error('Error loading completed session data:', error);
      // En cas d'erreur, utiliser des données par défaut
      setCompletedSessionData({
        totalTime: '--',
        effectiveTime: '--',
        penaltyTime: '--',
        bonusCorrect: 0,
        bonusTotal: 0
      });
    }
  };

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

  // Gestion du "donner sa langue au chat" pour les étapes de direction
  const handleGiveUp = async () => {
    if (!stepData) return;

    setSubmitting(true);
    try {
      // La pénalité est maintenant gérée côté serveur
      const response = await fetch(`/api/session/${sessionId}/complete-substep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName: stepData.stepName,
          subStepType: stepData.currentSubStep,
          data: { giveUp: true } // Indique au serveur d'ajouter une pénalité
        }),
      });

      if (response.ok) {
        // Déclencher l'animation de pénalité côté client (5 minutes)
        showPenaltyAnimationOnly(5);
        // Puis recharger les pénalités depuis la BDD après l'ajout côté serveur
        await reloadPenalties();
        
        // Attendre que l'animation de pénalité soit terminée puis afficher la transition
        setTimeout(() => {
          // Obtenir la bonne réponse depuis la configuration des étapes
          const correctAnswer = getStepCorrectAnswer(stepData.stepName, stepData.currentSubStep as 'direction');
          showSubStepTransitionMessage(false, 'direction', false, correctAnswer || undefined);
        }, 1500); // 1.5 secondes pour laisser l'animation de pénalité s'afficher
      } else {
        const data = await response.json();
        toast.error(data.error, { className: quizToastClass });
      }
    } catch (error) {
      console.error('Error giving up:', error);
      toast.error('Erreur lors de l\'abandon', { 
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
        // Jouer le son approprié selon le type de question (sauf pour les clés)
        if (stepData.subStepData.type === 'bonus') {
          playSound(SoundName.AIR_HORN_WIN); // airHornWin pour bonus réussi
        } else if (stepData.subStepData.type === 'enigma' || stepData.subStepData.type === 'final') {
          playSound(SoundName.DBZ_KI_BLAST); // dbzKiBlast pour énigme réussie
        } else if (stepData.subStepData.type === 'direction') {
          playSound(SoundName.POKEMON_CAUGHT); // pokemonCaught pour direction réussie
        }
        // Pas de son pour les clés (type === 'key')
        
        // Début de la transition - masquer immédiatement l'ancienne question
        setIsCorrectAnswer(true);
        
        // Confettis seulement si ce n'est pas une clé
        if (stepData.subStepData.type !== 'key') {
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
        }
        
        // Charger la nouvelle question en arrière-plan pendant les confettis
        setTimeout(async () => {
          if (data.completed) {
            await loadCompletedSessionData();
            setCompleted(true);
          } else {
            // Pour direction, enigma et bonus : utiliser la transition
            if (stepData.subStepData.type === 'direction' || 
                stepData.subStepData.type === 'enigma' || 
                stepData.subStepData.type === 'bonus') {
              showSubStepTransitionMessage(true, stepData.subStepData.type, true); // skipSound = true car son déjà joué
            } else {
              // Pour les autres types (key, final, etc.) : charger directement
              await loadCurrentStep();
            }
          }
          // Finir la transition
          setIsCorrectAnswer(false);
        }, 2000); // 2 secondes pour les confettis
      } else {
        // Jouer le son approprié selon le type de question en cas d'erreur
        if (stepData.subStepData.type === 'bonus') {
          playSound(SoundName.DBZ_GHOST); // dbzGhost pour bonus raté
        } else if (stepData.subStepData.type === 'enigma' || stepData.subStepData.type === 'final' || stepData.subStepData.type === 'key') {
          // Utiliser wrong1 pour les énigmes
          playSound(SoundName.WRONG1);
        } else if (stepData.subStepData.type === 'direction') {
          playSound(SoundName.WRONG3); // wrong3 pour direction ratée
        }
        
        // Vérifier si c'est l'étape finale
        if (stepData.subStepData.type === 'final') {
          // Pour l'étape finale, la pénalité est déjà gérée côté serveur dans addEnigmaAttempt
          // Déclencher l'animation de pénalité côté client (1 minute)
          showPenaltyAnimationOnly(1);
          // Puis recharger les pénalités depuis la BDD après l'ajout côté serveur
          await reloadPenalties();
          wrongAnswerToastRef.current?.show();
          
          // Jouer le son approprié si spécifié
          if (data.playSound) {
            if (data.playSound === 'scratchStop') {
              playSound(SoundName.SCRATCH_STOP);
            } else if (data.playSound === 'alarmEnd') {
              playSound(SoundName.ALARM_END);
            }
          }
          
          // Vérifier si on doit passer à l'étape suivante (tentatives épuisées)
          if (data.moveToNext) {
            setTimeout(async () => {
              if (data.completed) {
                await loadCompletedSessionData();
                setCompleted(true);
              } else {
                // Utiliser la transition pour l'étape finale échouée
                showSubStepTransitionMessage(false, 'final', false, data.correctAnswer);
              }
            }, 1500);
          } else {
            // Recharger les données pour mettre à jour le compteur de tentatives
            await loadCurrentStep();
          }
        } else if (stepData.subStepData.type === 'enigma') {
          // Pour les énigmes, la pénalité est déjà gérée côté serveur dans addEnigmaAttempt
          // Déclencher l'animation de pénalité côté client (1 minute)
          showPenaltyAnimationOnly(1);
          // Puis recharger les pénalités depuis la BDD après l'ajout côté serveur
          await reloadPenalties();
          wrongAnswerToastRef.current?.show();
          
          // Jouer le son approprié si spécifié
          if (data.playSound) {
            if (data.playSound === 'scratchStop') {
              playSound(SoundName.SCRATCH_STOP);
            } else if (data.playSound === 'alarmEnd') {
              playSound(SoundName.ALARM_END);
            }
          }
          
          // Vérifier si on doit passer à l'étape suivante (tentatives épuisées)
          if (data.moveToNext) {
            setTimeout(async () => {
              if (data.completed) {
                await loadCompletedSessionData();
                setCompleted(true);
              } else {
                // Utiliser la transition pour les énigmes échouées
                showSubStepTransitionMessage(false, 'enigma', false, data.correctAnswer);
              }
            }, 1500);
          } else {
            // Recharger les données pour mettre à jour le compteur de tentatives
            await loadCurrentStep();
          }
        } else if (stepData.subStepData.type === 'key') {
          // Pour les clés, la pénalité est déjà gérée côté serveur dans addKeyPenalty
          // Déclencher l'animation de pénalité côté client (5 minutes)
          showPenaltyAnimationOnly(5);
          // Puis recharger les pénalités depuis la BDD après l'ajout côté serveur
          await reloadPenalties();
          
          // Recharger directement l'étape après un délai pour laisser l'animation se terminer
          setTimeout(async () => {
            await loadCurrentStep();
          }, 1500); // Délai pour permettre l'affichage de l'animation de pénalité
        } else {
          // Vérifier si c'est un bonus raté qui doit passer à la suite
          if (data.moveToNext) {
            // Pour les bonus, utiliser le WrongAnswerToast au lieu du toast système
            wrongAnswerToastRef.current?.show();
            
            // Attendre que le toast disparaisse (3 secondes) puis charger la prochaine étape
            setTimeout(async () => {
              if (data.completed) {
                await loadCompletedSessionData();
                setCompleted(true);
              } else {
                // Utiliser la transition pour les bonus échoués
                showSubStepTransitionMessage(false, 'bonus', false, data.correctAnswer);
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

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  // Rendu conditionnel selon l'état
  if (loading) {
    return <LoadingState />;
  }

  if (completed) {
    return <CompletedState onGoToScoreboard={goToScoreboard} sessionData={completedSessionData || undefined} />;
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

    // Ajouter l'overlay de transition pour les substeps concernés
    const shouldShowTransition = stepData.subStepData.type === 'direction' || 
                                stepData.subStepData.type === 'enigma' || 
                                stepData.subStepData.type === 'bonus' ||
                                stepData.subStepData.type === 'final';
    const propsWithTransition = shouldShowTransition ? {
      ...commonProps,
      transitionOverlay: subStepTransition
    } : commonProps;

    switch (stepData.subStepData.type) {
      case 'direction':
        return (
          <DirectionSubStep
            {...propsWithTransition}
            content={stepData.subStepData.content!}
            onSubmit={handleAnswerSubmit}
            totalHints={stepData.totalHints}
            currentHintIndex={stepData.stepSession.currentHintIndex}
            onHintUsed={handleHintUsed}
            onPenaltyAnimationTrigger={showPenaltyAnimationOnly}
            onPenaltiesReload={reloadPenalties}
            onGiveUp={handleGiveUp}
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
            {...propsWithTransition}
            question={stepData.subStepData.question!}
            onSubmit={handleAnswerSubmit}
            totalHints={stepData.totalHints}
            currentHintIndex={stepData.stepSession.currentHintIndex}
            onHintUsed={handleHintUsed}
            onPenaltyAnimationTrigger={showPenaltyAnimationOnly}
            onPenaltiesReload={reloadPenalties}
            sessionId={sessionId}
            attemptsCount={stepData.stepSession.enigmaAttemptsCount}
            maxAttempts={10}
          />
        );

      case 'bonus':
        return (
          <BonusSubStep
            {...propsWithTransition}
            question={stepData.subStepData.question!}
            onSubmit={handleAnswerSubmit}
          />
        );

      case 'key':
        return (
          <KeySubStep
            {...commonProps}
            content={stepData.subStepData.content!}
            onSubmit={handleAnswerSubmit}
          />
        );

      case 'final':
        return (
          <FinalSubStep
            {...propsWithTransition}
            question={stepData.subStepData.question!}
            onSubmit={handleAnswerSubmit}
            attemptsCount={stepData.stepSession.enigmaAttemptsCount}
            maxAttempts={10}
            sessionId={sessionId}
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
      <div className="absolute top-16 left-0 right-0 z-10 text-center pt-2">
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
            <div className="text-6xl animate-bounce">{transitionStepName.includes('finale') ? '🏁' : '🚀'}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide animate-pulse">
              C&apos;est parti pour
            </h1>
            <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 tracking-wider">
              {transitionStepName}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full shadow-lg shadow-violet-400/50"></div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="min-h-screen flex flex-col pt-28 pb-32 px-4">
        <div className="flex-1 flex items-center justify-center">
          {renderSubStep()}
        </div>
      </div>

      {/* Toast custom pour mauvaise réponse */}
      <WrongAnswerToast 
        ref={wrongAnswerToastRef}
        message={stepData.subStepData.type === 'bonus' ? "❌ C'est raté !" : "❌ Nope !"}
      />
    </div>
  );
};

export default QuizPage;

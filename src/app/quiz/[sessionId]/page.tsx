'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTimer } from '@/hooks/use-timer';
import confetti from 'canvas-confetti';

// Composants
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { LoadingState, CompletedState, ErrorState } from '@/components/quiz/QuizStates';
import { DirectionSubStep } from '@/components/substeps/DirectionSubStep';
import { EnigmaSubStep } from '@/components/substeps/EnigmaSubStep';
import { BonusSubStep } from '@/components/substeps/BonusSubStep';
import { KeySubStep } from '@/components/substeps/KeySubStep';

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
  };
}

interface SessionInfo {
  pseudo: string | null;
  startedAt: string;
}

interface Hint {
  hint: string;
  hintIndex: number;
  totalHints: number;
}

const QuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [stepData, setStepData] = useState<StepData | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isStepEntering, setIsStepEntering] = useState(false);

  // Hook pour le timer
  const elapsedTime = useTimer(sessionInfo?.startedAt || null);

  // Classe Tailwind pour les toasts de la page quiz - positionnés au-dessus du footer
  const quizToastClass = "transform -translate-y-22";

  // Ouvrir la modale quand un nouvel indice est chargé
  useEffect(() => {
    if (isLoadingHint && hints.length > 0) {
      setHintModalOpen(true);
      setIsLoadingHint(false);
    }
  }, [hints, isLoadingHint]);

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
        setStepData(stepData);
        setHints([]);
        
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
      toast.error('Erreur lors de la validation', { className: quizToastClass });
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

  // Gestion de l'obtention d'un indice
  const getHint = async () => {
    if (!stepData) return;

    // Si l'indice est déjà chargé, juste ouvrir la modale
    if (hints.length > 0) {
      setHintModalOpen(true);
      return;
    }

    // Sinon, charger l'indice
    setIsLoadingHint(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName: stepData.stepName,
          hintIndex: 0,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setHints([data]);
        // La modale s'ouvrira automatiquement via useEffect
      } else {
        setIsLoadingHint(false);
        toast.error(data.error, {
          className: quizToastClass
        });
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setIsLoadingHint(false);
      toast.error('Erreur lors de la récupération de l\'indice', {
        className: quizToastClass
      });
    }
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
    // Utilisation directe du stepRank pour un formatage propre
    const formattedStepName = `Étape ${stepData.stepRank.toString().padStart(2, '0')}`;
    
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
            buttonText={stepData.subStepData.buttonText!}
            onComplete={handleSubStepComplete}
          />
        );

      case 'enigma':
        return (
          <EnigmaSubStep
            {...commonProps}
            question={stepData.subStepData.question!}
            hint={stepData.subStepData.hint!}
            onSubmit={handleAnswerSubmit}
            onGetHint={getHint}
            hintModalOpen={hintModalOpen}
            setHintModalOpen={setHintModalOpen}
            hints={hints}
            isLoadingHint={isLoadingHint}
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

      default:
        return <ErrorState message="Type de sous-étape non reconnu" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 relative overflow-hidden">
      {/* Header avec pseudo et timer */}
      <QuizHeader 
        pseudo={sessionInfo?.pseudo || null} 
        sessionId={sessionId} 
        elapsedTime={elapsedTime} 
      />

      {/* Contenu principal */}
      <div className="min-h-screen flex flex-col pt-20 pb-32 px-4">
        <div className="flex-1 flex items-center justify-center">
          {renderSubStep()}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

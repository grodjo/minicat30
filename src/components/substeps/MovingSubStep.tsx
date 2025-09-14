'use client';

import { Button } from '@/components/ui/button';
import { SubStep } from './SubStep';
import { playEventSound, EventSound } from '@/lib/sounds';

interface MovingSubStepProps {
  stepName: string;
  text: string;
  onComplete: () => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export const MovingSubStep = ({
  stepName,
  text,
  onComplete,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering
}: MovingSubStepProps) => {
  const handleMovingComplete = () => {
    // Jouer le son directionComplete à la fin de l'étape de déplacement
    playEventSound(EventSound.directionComplete);
    onComplete();
  };

  const bottomContent = (
    <div className="w-full space-y-3">
      <p className="text-center text-slate-400 text-lg font-medium">
        Appuyez ici quand vous êtes arrivé
      </p>
      <Button
        onClick={handleMovingComplete}
        disabled={isSubmitting || isCorrectAnswer}
        className="w-full h-14 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold text-lg rounded-xl shadow-lg"
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          "On y est !"
        )}
      </Button>
    </div>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="🏃"
      typeLabel="En déplacement"
      title={text}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {/* Pas de contenu supplémentaire pour le MovingSubStep */}
    </SubStep>
  );
};

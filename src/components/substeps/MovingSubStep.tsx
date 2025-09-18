'use client';

import { Button } from '@/components/ui/button';
import { SubStep } from './SubStep';
import { playSound, SoundName } from '@/lib/sounds';

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
    // Jouer le son ps2Connection à la fin de l'étape de déplacement
    playSound(SoundName.PS2_CONNECTION);
    onComplete();
  };

  const bottomContent = (
    <div className="w-full space-y-3">
      <p className="text-center text-slate-400 text-lg font-medium">
        Appuyez ici quand vous serez arrivé
      </p>
      <Button
        onClick={handleMovingComplete}
        disabled={isSubmitting || isCorrectAnswer}
        className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
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
      typeLabel="Déplacement"
      title={text}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {/* Pas de contenu supplémentaire pour le MovingSubStep */}
    </SubStep>
  );
};

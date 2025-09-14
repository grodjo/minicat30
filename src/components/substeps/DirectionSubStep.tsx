'use client';

import { Button } from '@/components/ui/button';
import { SubStep } from './SubStep';
import { Hints } from './Hints';
import { playEventSound, EventSound } from '@/lib/sounds';

interface DirectionSubStepProps {
  stepName: string;
  content: string;
  buttonText: string;
  onComplete: () => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
  totalHints: number;
  currentHintIndex: number;
  onHintUsed: (newHintIndex: number) => void;
  onTimePenalty: (minutes: number) => void;
  sessionId: string;
}

export const DirectionSubStep = ({
  stepName,
  content,
  buttonText,
  onComplete,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering,
  totalHints,
  currentHintIndex,
  onHintUsed,
  onTimePenalty,
  sessionId
}: DirectionSubStepProps) => {
  const handleDirectionComplete = () => {
    // Jouer le son pokemonCaught à la fin de l'étape de direction - maintenant instantané par défaut
    playEventSound(EventSound.directionComplete);
    onComplete();
  };

  const bodyContent = (
    <div className="w-full">
      {/* Section des indices */}
      <Hints
        sessionId={sessionId}
        totalHints={totalHints}
        currentHintIndex={currentHintIndex}
        onHintUsed={onHintUsed}
        onTimePenalty={onTimePenalty}
      />
    </div>
  );

  const bottomContent = (
    <Button
      onClick={handleDirectionComplete}
      disabled={isSubmitting || isCorrectAnswer}
      className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
    >
      {isSubmitting ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        buttonText
      )}
    </Button>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="🧭"
      typeLabel="Orientation"
      title={content}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {bodyContent}
    </SubStep>
  );
};

'use client';

import { Button } from '@/components/ui/button';
import { SubStep } from './SubStep';

interface KeySubStepProps {
  stepName: string;
  content: string;
  buttonText: string;
  onComplete: () => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export const KeySubStep = ({
  stepName,
  content,
  buttonText,
  onComplete,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering
}: KeySubStepProps) => {
  const bottomContent = (
    <Button
      onClick={onComplete}
      disabled={isSubmitting || isCorrectAnswer}
      className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white font-semibold text-lg rounded-xl shadow-lg"
    >
      {isSubmitting ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <>
          🗝️ {buttonText}
        </>
      )}
    </Button>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="🗝️"
      typeLabel="Trouvez la clé !"
      title={content}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    />
  );
};

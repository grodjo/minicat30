import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';

interface FinalSubStepProps {
  stepName: string;
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export const FinalSubStep = ({
  stepName,
  question,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering
}: FinalSubStepProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  const finalContent = (
    <div className="text-center mb-6">
      <p className="text-red-300/80 text-lg font-semibold">
        Chaque mauvaise réponse coûte 1 minute supplémentaire !
      </p>
    </div>
  );

  const bottomContent = (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <Input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="flex-1 h-16 bg-slate-50/95 border-violet-300/50 text-violet-700 placeholder:text-violet-500/70 text-xl font-semibold focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-2xl shadow-lg text-center"
          placeholder="Votre réponse finale..."
          required
          disabled={isSubmitting || isCorrectAnswer}
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isSubmitting || isCorrectAnswer}
          className="h-16 px-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-xl rounded-2xl shadow-xl flex-shrink-0"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <span className="text-2xl">🏁</span>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="🏁"
      typeLabel="Énigme finale"
      title={question}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {finalContent}
    </SubStep>
  );
};
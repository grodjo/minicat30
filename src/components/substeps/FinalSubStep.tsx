import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';

interface FinalSubStepProps {
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export const FinalSubStep = ({
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

  const bottomContent = (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <Input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="flex-1 h-14 bg-slate-50/95 border-violet-300/50 text-violet-700 placeholder:text-violet-500/70 text-lg font-semibold focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-xl shadow-sm"
          placeholder="Votre réponse finale..."
          required
          disabled={isSubmitting || isCorrectAnswer}
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isSubmitting || isCorrectAnswer}
          className="h-14 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <span className="text-xl">🏁</span>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <SubStep
      stepName="Étape finale"
      typeIcon="🏁"
      typeLabel="Question finale"
      title={question}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {/* Pas d'indice disponible pour l'étape finale */}
      <div className="text-center mb-8">
        <p className="text-violet-200/70 text-lg font-medium">
          Utilisez toutes les clés que vous avez collectées ! 🗝️
        </p>
      </div>
    </SubStep>
  );
};
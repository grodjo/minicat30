'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';

interface BonusSubStepProps {
  stepName: string;
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
  transitionOverlay?: {
    show: boolean;
    message: string;
    success: boolean;
    fadeOut: boolean;
    correctAnswer?: string;
  };
}

export const BonusSubStep = ({
  stepName,
  question,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering,
  transitionOverlay
}: BonusSubStepProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  const bodyContent = (
    <div className="text-center mb-6">
      <p className="text-amber-400 text-lg font-semibold">
        ⚠️ Une seule tentative !
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
          className="flex-1 h-14 bg-slate-50/95 border-violet-300/50 text-violet-700 placeholder:text-violet-500/70 text-lg font-semibold focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-xl shadow-sm"
          placeholder="La réponse est..."
          required
          disabled={isSubmitting || isCorrectAnswer}
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isSubmitting || isCorrectAnswer}
          className="h-14 w-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <span className="text-xl">➤</span>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="🧠"
      typeLabel="Bonus"
      title={question}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
      transitionOverlay={transitionOverlay}
    >
      {bodyContent}
    </SubStep>
  );
};

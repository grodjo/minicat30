'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';
import { Hints } from './Hints';

interface DirectionSubStepProps {
  stepName: string;
  content: string;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
  totalHints: number;
  currentHintIndex: number;
  onHintUsed: (newHintIndex: number) => void;
  onTimePenalty: (minutes: number) => void;
  onGiveUp: () => void;
  sessionId: string;
  transitionOverlay?: {
    show: boolean;
    message: string;
    success: boolean;
    fadeOut: boolean;
  };
}

export const DirectionSubStep = ({
  stepName,
  content,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering,
  totalHints,
  currentHintIndex,
  onHintUsed,
  onTimePenalty,
  onGiveUp,
  sessionId,
  transitionOverlay
}: DirectionSubStepProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
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
      
      {/* Bouton "donner sa langue au chat" - visible seulement quand tous les indices sont utilisés */}
      {currentHintIndex >= totalHints && !isCorrectAnswer && (
        <div className="mt-6 text-center">
          <Button
            onClick={onGiveUp}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
          >
            🏳️ Donner sa langue au chat
          </Button>
        </div>
      )}
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
          placeholder="Le point de rdv est..."
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
            <span className="text-xl">➤</span>
          )}
        </Button>
      </div>
    </form>
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
      transitionOverlay={transitionOverlay}
    >
      {bodyContent}
    </SubStep>
  );
};

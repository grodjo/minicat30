import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';
import { Hints } from './Hints';


interface EnigmaSubStepProps {
  stepName: string;
  question: string;
  onSubmit: (answer: string) => void;
  totalHints: number;
  currentHintIndex: number;
  onHintUsed: (newHintIndex: number) => void;
  onTimePenalty: (minutes: number) => void;
  sessionId: string;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
  attemptsCount?: number;
  maxAttempts?: number;
}

export const EnigmaSubStep = ({
  stepName,
  question,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering,
  totalHints,
  currentHintIndex,
  onHintUsed,
  onTimePenalty,
  sessionId,
  attemptsCount = 0,
  maxAttempts = 10
}: EnigmaSubStepProps) => {
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
      
      {/* Compteur de tentatives */}
      <div className="text-center mb-8">
        <div className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
          attemptsCount >= maxAttempts 
            ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
            : attemptsCount >= maxAttempts * 0.8 
              ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
              : 'bg-violet-500/20 text-violet-300 border border-violet-400/30'
        }`}>
          🎯 Tentatives : {attemptsCount}/{maxAttempts}
        </div>
      </div>
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
          placeholder="Votre réponse..."
          required
          disabled={isSubmitting || isCorrectAnswer || attemptsCount >= maxAttempts}
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isSubmitting || isCorrectAnswer}
          className="h-14 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <span className="text-xl">🎯</span>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="❓"
      typeLabel="Énigme"
      title={question}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {bodyContent}
    </SubStep>
  );
};

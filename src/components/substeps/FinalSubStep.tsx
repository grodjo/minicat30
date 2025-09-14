import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';
import { CollectedKeysModal } from '@/components/substeps/CollectedKeysModal';

interface FinalSubStepProps {
  stepName: string;
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
  attemptsCount?: number;
  maxAttempts?: number;
  sessionId: string;
}

export const FinalSubStep = ({
  stepName,
  question,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering,
  attemptsCount = 0,
  maxAttempts = 10,
  sessionId
}: FinalSubStepProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  const bodyContent = (
    <div className="text-center mb-6 space-y-4">
      {/* Bouton pour voir les clés collectées */}
      <div className="flex justify-center mb-4">
        <CollectedKeysModal sessionId={sessionId} />
      </div>
      
      {/* Compteur de tentatives */}
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
          disabled={isSubmitting || isCorrectAnswer || attemptsCount >= maxAttempts}
        />
        <Button
          type="submit"
          disabled={!answer.trim() || isSubmitting || isCorrectAnswer || attemptsCount >= maxAttempts}
          className="h-16 px-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-xl rounded-2xl shadow-xl flex-shrink-0 disabled:opacity-50"
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
      {bodyContent}
    </SubStep>
  );
};
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubStep } from './SubStep';

interface KeySubStepProps {
  stepName: string;
  content: string;
  onSubmit: (key: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export const KeySubStep = ({
  stepName,
  content,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering
}: KeySubStepProps) => {
  const [keyInput, setKeyInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    onSubmit(keyInput.trim());
  };

  const bottomContent = (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Inscrivez la clé trouvée..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          disabled={isSubmitting || isCorrectAnswer}
          className="flex-1 h-14 bg-slate-50/95 border-yellow-300/50 text-yellow-700 placeholder:text-yellow-500/70 text-lg font-semibold focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/70 rounded-xl shadow-sm"
          required
        />
        <Button
          type="submit"
          disabled={!keyInput.trim() || isSubmitting || isCorrectAnswer}
          className="h-14 px-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-white font-semibold text-lg rounded-xl shadow-lg"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <span className="text-xl">🗝️</span>
          )}
        </Button>
      </div>
    </form>
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

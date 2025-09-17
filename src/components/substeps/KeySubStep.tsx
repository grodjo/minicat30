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

  // Limiter l'input à un seul chiffre
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permettre seulement les chiffres et limiter à 1 caractère
    if (/^\d?$/.test(value)) {
      setKeyInput(value);
    }
  };

  const bodyContent = (
    <div className="text-center mb-6">
      <p className="text-red-400 text-base font-bold">
        ⚠️ Chaque mauvaise réponse coûte 5 minutes !
      </p>
    </div>
  );

  const bottomContent = (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Un seul chiffre..."
            value={keyInput}
            onChange={handleInputChange}
            disabled={isSubmitting || isCorrectAnswer}
            className="flex-1 h-14 bg-slate-50/95 border-violet-300/50 text-violet-700 placeholder:text-violet-500/70 text-lg font-semibold focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-xl shadow-sm text-center"
            required
            maxLength={1}
          />
          <Button
            type="submit"
            disabled={!keyInput.trim() || isSubmitting || isCorrectAnswer}
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
    </div>
  );

  return (
    <SubStep
      stepName={stepName}
      typeIcon="🗝️"
      typeLabel="Le chiffre clé"
      title={content}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {bodyContent}
    </SubStep>
  );
};

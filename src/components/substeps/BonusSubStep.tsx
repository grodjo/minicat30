'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BonusSubStepProps {
  stepName: string;
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export default function BonusSubStep({
  stepName,
  question,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering
}: BonusSubStepProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  return (
    <>
      {/* Contenu principal */}
      <div className={`w-full max-w-2xl transition-all duration-300 ${
        isCorrectAnswer ? 'animate-question-vanish' : 
        isStepEntering ? 'animate-question-bounce-in' : 
        'opacity-100 transform translate-y-0'
      }`}>
        {/* Titre de l'étape */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-violet-200/90 tracking-wider mb-3">
            {stepName}
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto"></div>
        </div>

        {/* Indicateur de type */}
        <div className="text-center mb-6">
          <p className="text-violet-300 text-lg italic">
            🎯 Question Bonus
          </p>
          <p className="text-amber-400 text-sm font-medium mt-2">
            ⚠️ Une seule tentative !
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed">
          {question}
        </h1>
      </div>

      {/* Zone de saisie fixée en bas */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-violet-200/50 shadow-2xl p-4 transition-all duration-500 ${
        isCorrectAnswer ? 'transform translate-y-full opacity-0' : 
        isStepEntering ? 'animate-input-slide-up' : ''
      }`}>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <Input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-1 h-14 bg-white border-amber-300/50 text-slate-900 placeholder:text-amber-600/60 text-lg font-medium focus:border-amber-400 focus:ring-2 focus:ring-amber-400/70 rounded-xl"
              placeholder="Votre réponse (une seule chance)..."
              required
              disabled={isSubmitting || isCorrectAnswer}
            />
            <Button
              type="submit"
              disabled={!answer.trim() || isSubmitting || isCorrectAnswer}
              className="h-14 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 text-white font-semibold text-lg rounded-xl shadow-lg"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span className="text-xl">🎯</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

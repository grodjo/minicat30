'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EnigmaSubStepProps {
  stepName: string;
  question: string;
  hint: string;
  onSubmit: (answer: string) => void;
  onGetHint: () => void;
  hintModalOpen: boolean;
  setHintModalOpen: (open: boolean) => void;
  hints: Array<{ hint: string; hintIndex: number; totalHints: number }>;
  isLoadingHint: boolean;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export default function EnigmaSubStep({
  stepName,
  question,
  hint,
  onSubmit,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering,
  onGetHint,
  hintModalOpen,
  setHintModalOpen,
  hints,
  isLoadingHint
}: EnigmaSubStepProps) {
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
            🧩 Énigme
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed">
          {question}
        </h1>

        {/* Bouton d'indice */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Dialog 
              open={hintModalOpen} 
              onOpenChange={setHintModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={onGetHint}
                  disabled={isLoadingHint || isCorrectAnswer}
                  variant="outline"
                  className={`
                    ${hints.length > 0
                      ? 'bg-green-500/20 border-green-400/50 text-green-200 hover:bg-green-400/30 hover:text-green-100' 
                      : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200 hover:bg-yellow-400/30 hover:text-yellow-100'
                    } 
                    disabled:opacity-50 min-w-[120px] font-semibold
                  `}
                >
                  {isLoadingHint ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <>
                      {hints.length > 0 ? '✅' : '💡'} Indice
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-yellow-50 border-yellow-200">
                <DialogHeader>
                  <DialogTitle className="text-yellow-800">💡 Indice</DialogTitle>
                  <DialogDescription className="text-yellow-700 text-base font-medium">
                    {hints.find(h => h.hintIndex === 0)?.hint || hint}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
              className="flex-1 h-14 bg-white border-violet-300/50 text-slate-900 placeholder:text-violet-600/60 text-lg font-medium focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-xl"
              placeholder="Votre réponse..."
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
      </div>
    </>
  );
}

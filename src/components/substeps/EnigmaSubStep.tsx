import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SubStep } from './SubStep';

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
  hasUsedHint: boolean;
}

export const EnigmaSubStep = ({
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
  isLoadingHint,
  hasUsedHint
}: EnigmaSubStepProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  const hintButton = (
    <div className="text-center mb-8">
      <div className="flex justify-center">
        {/* Bouton indépendant sans DialogTrigger */}
        <Button
          onClick={onGetHint}
          disabled={isLoadingHint || isCorrectAnswer}
          className={`
            ${hasUsedHint
              ? 'bg-green-600 hover:bg-green-500 text-white border-green-500 shadow-green-500/30' 
              : 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500 shadow-yellow-500/30'
            } 
            disabled:opacity-50 min-w-[120px] font-semibold text-base px-4 py-2 rounded-lg shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 border-2 transform hover:-translate-y-0.5
          `}
        >
          {isLoadingHint ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              {hasUsedHint ? '✅' : '💡'} Indice
            </>
          )}
        </Button>
        
        {/* Dialog séparée du bouton */}
        <Dialog 
          open={hintModalOpen} 
          onOpenChange={setHintModalOpen}
        >
          <DialogContent className="bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 border-amber-300/30 text-white max-w-lg w-full min-h-[40vh] flex flex-col justify-between">
            <DialogHeader className="space-y-6 pt-8">
              <DialogTitle className="text-3xl md:text-4xl font-bold text-center text-amber-200">
                Indice
              </DialogTitle>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full"></div>
              <DialogDescription className="text-amber-200/90 text-center text-lg md:text-xl leading-relaxed px-6 font-medium">
                {hints.find(h => h.hintIndex === 0)?.hint || hint}
              </DialogDescription>
            </DialogHeader>
            
            {/* Bouton de fermeture centré */}
            <div className="flex justify-center py-8">
              <button
                onClick={() => setHintModalOpen(false)}
                className="relative px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 active:translate-y-1 group cursor-pointer"
                style={{
                  background: 'linear-gradient(145deg, #f59e0b, #d97706, #b45309)',
                  boxShadow: '8px 8px 16px rgba(30, 27, 75, 0.5), -4px -4px 8px rgba(245, 158, 11, 0.2)'
                }}
              >
                <div className="relative z-10 flex items-center justify-center text-white font-semibold">
                  Compris ! 👍
                </div>
                
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
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
      typeIcon="❓"
      typeLabel="Énigme"
      title={question}
      isCorrectAnswer={isCorrectAnswer}
      isStepEntering={isStepEntering}
      bottomContent={bottomContent}
    >
      {hintButton}
    </SubStep>
  );
};

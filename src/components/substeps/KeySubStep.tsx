'use client';

import { Button } from '@/components/ui/button';

interface KeySubStepProps {
  stepName: string;
  content: string;
  buttonText: string;
  onComplete: () => void;
  isSubmitting: boolean;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
}

export const KeySubStep = ({
  stepName,
  content,
  buttonText,
  onComplete,
  isSubmitting,
  isCorrectAnswer,
  isStepEntering
}: KeySubStepProps) => {
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
            🗝️ Trouvez la clé !
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed">
          {content}
        </h1>
      </div>

      {/* Zone de contrôle fixée en bas */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-violet-200/50 shadow-2xl p-4 transition-all duration-500 ${
        isCorrectAnswer ? 'transform translate-y-full opacity-0' : 
        isStepEntering ? 'animate-input-slide-up' : ''
      }`}>
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={onComplete}
            disabled={isSubmitting || isCorrectAnswer}
            className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white font-semibold text-lg rounded-xl shadow-lg"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                🗝️ {buttonText}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

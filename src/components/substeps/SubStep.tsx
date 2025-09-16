'use client';

import { ReactNode } from 'react';

interface SubStepProps {
  stepName: string;
  typeIcon: string;
  typeLabel: string;
  title: string;
  isCorrectAnswer: boolean;
  isStepEntering: boolean;
  children?: ReactNode;
  bottomContent: ReactNode;
}

export const SubStep = ({
  stepName,
  typeIcon,
  typeLabel,
  title,
  isCorrectAnswer,
  isStepEntering,
  children,
  bottomContent
}: SubStepProps) => {
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
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full shadow-lg shadow-violet-400/50"></div>
        </div>

        {/* Indicateur de type */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 border border-violet-400/30 rounded-full backdrop-blur-sm shadow-lg">
            <span className="text-2xl">{typeIcon}</span>
            <p className="text-violet-200 text-lg font-semibold tracking-wide">
              {typeLabel}
            </p>
          </div>
        </div>

        {/* Titre principal */}
        <h1 className="text-2xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed whitespace-pre-line">
          {title}
        </h1>

        {/* Contenu spécifique à chaque substep */}
        {children}
      </div>

      {/* Zone de contrôle fixée en bas */}
      <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-md shadow-2xl p-4 transition-all duration-500 ${
        isCorrectAnswer ? 'transform translate-y-full opacity-0' : 
        isStepEntering ? 'animate-input-slide-up' : ''
      }`}>
        <div className="max-w-2xl mx-auto">
          {bottomContent}
        </div>
      </div>
    </>
  );
};

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
          <div className="w-16 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto"></div>
        </div>

        {/* Indicateur de type */}
        <div className="text-center mb-6">
          <p className="text-violet-300 text-lg italic">
            {typeIcon} {typeLabel}
          </p>
        </div>

        {/* Titre principal */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed">
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

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
  transitionOverlay?: {
    show: boolean;
    message: string;
    success: boolean;
    fadeOut: boolean;
  };
}

export const SubStep = ({
  stepName,
  typeIcon,
  typeLabel,
  title,
  isCorrectAnswer,
  isStepEntering,
  children,
  bottomContent,
  transitionOverlay
}: SubStepProps) => {
  return (
    <>
      {/* Overlay de transition pour les sous-étapes */}
      {transitionOverlay?.show && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm transition-all duration-500 ease-out ${
          transitionOverlay.fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="text-center space-y-6">
            <div className={`text-7xl transition-all duration-300 ${
              transitionOverlay.success ? 'text-green-400' : 'text-red-400'
            } ${transitionOverlay.fadeOut ? 'animate-none' : 'animate-bounce'}`}>
              {transitionOverlay.success ? '🎉' : '😔'}
            </div>
            <h2 className={`text-5xl font-bold transition-all duration-300 ${
              transitionOverlay.success ? 'text-green-300' : 'text-red-300'
            } ${transitionOverlay.fadeOut ? 'animate-none' : 'animate-pulse'}`}>
              {transitionOverlay.message}
            </h2>
            <div className={`w-32 h-1 mx-auto rounded-full transition-all duration-300 ${
              transitionOverlay.success ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-rose-400'
            } ${transitionOverlay.fadeOut ? 'animate-none' : 'animate-pulse'}`}></div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className={`w-full max-w-2xl transition-all duration-500 ${
        transitionOverlay?.show ? 'opacity-0 scale-95' :
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
        transitionOverlay?.show ? 'transform translate-y-full opacity-0' :
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

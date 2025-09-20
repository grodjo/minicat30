'use client';

import { ReactNode, useMemo } from 'react';
import Image from 'next/image';
import { successDisplays, failDisplays } from '@/lib/random-displays';

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
    correctAnswer?: string;
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
  // Mémoiser les GIFs aléatoires pour éviter qu'ils changent à chaque re-render
  const successGif = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * successDisplays.length);
    return successDisplays[randomIndex].gif;
  }, []);

  const failGif = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * failDisplays.length);
    return failDisplays[randomIndex].gif;
  }, []);

  return (
    <>
      {/* Overlay de transition pour les sous-étapes */}
      {transitionOverlay?.show && (
        <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-40 backdrop-blur-sm transition-all duration-500 ease-out ${
          transitionOverlay.fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            {/* GIF qui rebondit */}
            <div className="flex justify-center">
              <video
                src={transitionOverlay.success ? successGif : failGif}
                autoPlay
                loop
                muted
                className="w-64 h-64 rounded-lg object-cover"
              />
            </div>
            
            {/* Message principal */}
            <div className="flex items-center justify-center gap-3">
              <h2 className={`text-4xl font-bold transition-all duration-300 ${
                transitionOverlay.success ? 'text-green-300' : 'text-red-300'
              } ${transitionOverlay.fadeOut ? 'animate-none' : 'animate-pulse'}`}>
                {transitionOverlay.success ? 'Bien joué !' : 'Dommage...'}
              </h2>
              {transitionOverlay.success ? (
                <Image
                  src="/cats/grinning-cat.svg"
                  alt="Grinning cat"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              ) : (
                <Image
                  src="/cats/crying-cat.svg"
                  alt="Crying cat"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              )}
            </div>
            
            {/* Réponse correcte en cas d'échec */}
            {!transitionOverlay.success && transitionOverlay.correctAnswer && (
              <p className="text-xl text-red-200 font-medium">
                La réponse était : <span className="font-bold text-white">{transitionOverlay.correctAnswer}</span>
              </p>
            )}
            
            <div className={`w-16 h-0.5 mx-auto rounded-full shadow-lg transition-all duration-300 ${
              transitionOverlay.success 
                ? 'bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-green-400/50' 
                : 'bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-red-400/50'
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

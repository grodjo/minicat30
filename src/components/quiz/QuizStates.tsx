'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { playEventSound, EventSound } from '@/lib/sounds';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Chargement..." }: LoadingStateProps = {}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
        <p className="text-violet-100">{message}</p>
      </div>
    </div>
  );
};

interface CompletedStateProps {
  onGoToScoreboard: () => void;
}

export const CompletedState = ({ onGoToScoreboard }: CompletedStateProps) => {
  // Jouer le son de victoire épique dès l'affichage de l'écran de félicitations
  useEffect(() => {
    playEventSound(EventSound.victory); // epicVictory
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-8xl mb-8 animate-bounce">🎉</div>
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
        Félicitations !
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8 rounded-full"></div>
      <p className="text-violet-200 mb-12 text-xl md:text-2xl font-light max-w-2xl leading-relaxed">
        Vous avez terminé le quiz avec brio !
      </p>
      <Button
        onClick={onGoToScoreboard}
        className="h-14 px-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-xl rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-violet-500/50"
      >
        <span className="mr-1 text-2xl">🏆</span>
        Voir le classement
      </Button>
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
}

export const ErrorState = ({ message = "Impossible de charger l'étape" }: ErrorStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border border-red-400/30">
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          Erreur
        </h1>
        <p className="text-red-200">
          {message}
        </p>
      </div>
    </div>
  );
};

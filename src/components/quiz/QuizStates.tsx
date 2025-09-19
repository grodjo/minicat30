'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { playSound, SoundName } from '@/lib/sounds';
import Image from 'next/image';

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
  sessionData?: {
    totalTime: string;
    effectiveTime: string;
    penaltyTime: string;
    bonusCorrect: number;
    bonusTotal: number;
  };
}

export const CompletedState = ({ onGoToScoreboard, sessionData }: CompletedStateProps) => {
  // Jouer le son de victoire épique dès l'affichage de l'écran de félicitations
  useEffect(() => {
    playSound(SoundName.EPIC_VICTORY);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-8xl mb-8 animate-bounce flex justify-center">
        <Image
          src="/cats/kissing-cat.svg"
          alt="Kissing cat"
          width={128}
          height={128}
          className="w-32 h-32"
        />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
        Félicitations
      </h1>
      <p className="text-2xl md:text-3xl text-violet-200 mb-8">
        Vous êtes arrivés au bout !
      </p>
      <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8 rounded-full"></div>
      
      {sessionData && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 max-w-lg w-full border border-violet-300/20">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300 text-lg">⏱️ Temps effectif :</span>
              <span className="text-yellow-300 font-semibold text-lg">{sessionData.effectiveTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-300 text-lg">⚠️ Pénalités :</span>
              <span className="text-red-300 font-semibold text-lg">{sessionData.penaltyTime}</span>
            </div>
            <div className="flex justify-between items-center border-t border-violet-300/30 pt-4">
              <span className="text-orange-300 text-xl font-bold">🏁 Temps final :</span>
              <span className="text-orange-300 font-bold text-2xl">{sessionData.totalTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-violet-300 text-xl">🧠 Questions bonus :</span>
              <span className="text-green-300 font-bold text-2xl">
                {sessionData.bonusCorrect}/{sessionData.bonusTotal}
              </span>
            </div>
          </div>
        </div>
      )}
      
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

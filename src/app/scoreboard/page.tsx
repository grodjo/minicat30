'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatScoreboardTime } from '@/lib/time-formatting';

// Helper function to format penalty time with hours
function formatPenaltyTime(penaltyMs: number): string {
  const totalMinutes = Math.round(penaltyMs / (60 * 1000));
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
  }
  return `${totalMinutes}min`;
}

interface ScoreboardEntry {
  rank: number;
  pseudo: string;
  totalTime: string;
  totalTimeMs: number;
  totalBonusCorrect: number;
  totalBonusAvailable: number;
  completedAt: string;
  steps: {
    stepName: string;
    timeSpent: string;
    timeSpentMs: number;
    penaltyTime: string;
    penaltyTimeMs: number;
    bonusCorrect: boolean;
  }[];
}

export default function ScoreboardPage() {
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<ScoreboardEntry | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadScoreboard();
  }, []);

  const loadScoreboard = async () => {
    try {
      const response = await fetch('/api/scoreboard');
      const data = await response.json();
      setScoreboard(data);
    } catch (error) {
      console.error('Error loading scoreboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-violet-100">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      
      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header avec titre et bouton retour */}
          <div className="text-center mb-12 pt-8">
            <div className="flex justify-start mb-10">
              <button
                onClick={goHome}
                className="text-violet-200 hover:text-white text-sm font-medium flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-violet-300/20 hover:bg-white/10 transition-all duration-200"
                suppressHydrationWarning
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Retour
              </button>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-2xl">
              🏆 CLASSEMENT
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto rounded-full shadow-lg shadow-violet-400/50 mb-4"></div>
            <p className="text-lg text-violet-200/80 font-medium">
              Classement par temps total final
            </p>
          </div>

          {scoreboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-12 max-w-md mx-auto">
                <div className="text-6xl mb-6">🏁</div>
                <p className="text-violet-100 text-xl mb-8">
                  Aucun quiz terminé pour le moment
                </p>
                <button
                  onClick={goHome}
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl shadow-violet-600/40 hover:shadow-violet-500/60 transition-all duration-300"
                  suppressHydrationWarning
                >
                  Commencer un quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreboard.map((entry) => (
                <div
                  key={`${entry.pseudo}-${entry.completedAt}`}
                  className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-4 hover:bg-white/15 transition-all duration-300 cursor-pointer border border-violet-300/20"
                  onClick={() => setSelectedPlayer(selectedPlayer?.pseudo === entry.pseudo ? null : entry)}
                >
                  {/* Player info with large position circle and simplified display */}
                  <div className='flex items-center justify-between gap-6'>
                    <div className='flex items-center gap-6 flex-grow'>
                      {/* Large position circle */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0 ${
                        entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                        entry.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900' :
                        'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      {/* Player name and main stats */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-2xl text-white mb-2">
                          {entry.pseudo}
                        </h3>
                        <div className="flex items-center gap-8 text-lg">
                          <span className="text-orange-300 font-bold">
                            🏁 {formatScoreboardTime(entry.totalTimeMs)}
                          </span>
                          <span className="text-green-300 font-semibold">
                            🧠 {entry.totalBonusCorrect}/{entry.totalBonusAvailable}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expand arrow */}
                    <div className={`text-violet-300 transition-transform duration-300 flex-shrink-0 ${
                      selectedPlayer?.pseudo === entry.pseudo ? 'rotate-180' : ''
                    }`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </div>
                  </div>

                  {selectedPlayer?.pseudo === entry.pseudo && (
                    <div className="mt-8 pt-6 border-t border-violet-300/20">
                      <h4 className="text-lg font-semibold text-violet-200 mb-4 flex items-center gap-2">
                        Détail par étape
                      </h4>
                      <div className="grid gap-4">
                        {entry.steps.map((step, index) => {
                          const stepNumber = step.stepName === "Étape finale" ? "finale" : String(index + 1).padStart(2, '0');
                          const stepDisplay = step.stepName === "Étape finale" ? "Étape finale" : `Étape ${stepNumber}`;
                          
                          return (
                            <div
                              key={`${entry.pseudo}-step-${index}`}
                              className="bg-white/5 rounded-xl p-6 border border-violet-300/10"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-violet-100 text-xl">
                                  {stepDisplay}
                                </span>
                                {step.stepName !== "Étape finale" && (
                                  <span className={`flex items-center gap-2 font-semibold text-lg ${step.bonusCorrect ? 'text-green-400' : 'text-orange-400'}`}>
                                    {step.bonusCorrect ? '🧠 ✅' : '🧠 ❌'}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between gap-4 text-base">
                                  <span className="text-yellow-300 text-left">
                                    ⏱️ {formatScoreboardTime(step.timeSpentMs - step.penaltyTimeMs)}
                                  </span>
                                  <span className="text-red-300 text-left">
                                    ⚠️ {formatPenaltyTime(step.penaltyTimeMs)}
                                  </span>
                                  <span className="text-orange-300 font-bold text-left">
                                    🏁 {formatScoreboardTime(step.timeSpentMs)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

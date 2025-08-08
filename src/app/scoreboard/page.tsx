'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ScoreboardEntry {
  rank: number;
  pseudo: string;
  totalTime: string;
  totalTimeMs: number;
  totalHints: number;
  completedAt: string;
  attempts: {
    questionId: string;
    timeSpent: string;
    timeSpentMs: number;
    hintsUsed: number;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-violet-100">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 relative">
      {/* Grille futuriste en arrière-plan */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:60px_60px] opacity-60"></div>
      
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
            <div className="w-24 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto"></div>
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
                  className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer border border-violet-300/20"
                  onClick={() => setSelectedPlayer(selectedPlayer?.pseudo === entry.pseudo ? null : entry)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-lg ${
                        entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                        entry.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900' :
                        'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white mb-1">
                          👤 {entry.pseudo}
                        </h3>
                        <p className="text-sm text-violet-200/80">
                          <span className="mr-1">📅</span>  {new Date(entry.completedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-300 mb-1">
                          ⏱️ {entry.totalTime}
                        </div>
                        <div className="text-sm text-violet-200/80">
                          💡 {entry.totalHints} indice{entry.totalHints !== 1 ? 's' : ''} utilisé{entry.totalHints !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className={`text-violet-300 transition-transform duration-300 ${
                        selectedPlayer?.pseudo === entry.pseudo ? 'rotate-180' : ''
                      }`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {selectedPlayer?.pseudo === entry.pseudo && (
                    <div className="mt-8 pt-6 border-t border-violet-300/20">
                      <div className="grid gap-4">
                        {entry.attempts.map((attempt, index) => (
                          <div
                            key={attempt.questionId}
                            className="bg-white/5 rounded-xl p-4 border border-violet-300/10"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-violet-100">
                                Question {index + 1}
                              </span>
                              <div className="flex items-center space-x-6">
                                <span className="text-yellow-300 font-semibold">
                                  ⏱️ {attempt.timeSpent}
                                </span>
                                <span className="text-violet-200/80 text-sm">
                                  💡 {attempt.hintsUsed} indice{attempt.hintsUsed !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
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

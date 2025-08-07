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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🏆 Classement
            </h1>
            <button
              onClick={goHome}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              suppressHydrationWarning
            >
              Nouveau Quiz
            </button>
          </div>

          {scoreboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun quiz terminé pour le moment
              </p>
              <button
                onClick={goHome}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                suppressHydrationWarning
              >
                Commencer un quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreboard.map((entry) => (
                <div
                  key={`${entry.pseudo}-${entry.completedAt}`}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedPlayer(selectedPlayer?.pseudo === entry.pseudo ? null : entry)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {entry.pseudo}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Terminé le {new Date(entry.completedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {entry.totalTime}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.totalHints} indice{entry.totalHints !== 1 ? 's' : ''} utilisé{entry.totalHints !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {selectedPlayer?.pseudo === entry.pseudo && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Détail par question :
                      </h4>
                      <div className="grid gap-3">
                        {entry.attempts.map((attempt, index) => (
                          <div
                            key={attempt.questionId}
                            className="bg-white rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                Question {index + 1}
                              </span>
                              <div className="flex items-center space-x-4">
                                <span className="text-blue-600 font-semibold">
                                  {attempt.timeSpent}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {attempt.hintsUsed} indice{attempt.hintsUsed !== 1 ? 's' : ''}
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

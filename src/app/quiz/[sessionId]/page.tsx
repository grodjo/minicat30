'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Question {
  id: string;
  order: number;
  title: string;
  hints: string[];
}

interface Hint {
  hint: string;
  hintIndex: number;
  totalHints: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const loadCurrentQuestion = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/current-question`);
      const data = await response.json();

      if (data.completed) {
        setCompleted(true);
        setMessage(data.message);
      } else {
        setQuestion(data);
        setHints([]);
        setAnswer('');
        setMessage('');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      setMessage('Erreur lors du chargement de la question');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    loadCurrentQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !question) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.isCorrect) {
        if (data.completed) {
          setCompleted(true);
        } else {
          // Passer à la question suivante après un délai
          setTimeout(() => {
            loadCurrentQuestion();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setMessage('Erreur lors de la soumission de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = async () => {
    if (!question) return;

    try {
      const response = await fetch(`/api/session/${sessionId}/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          hintIndex: hints.length,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setHints([...hints, data]);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setMessage('Erreur lors de la récupération de l\'indice');
    }
  };

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Félicitations !
          </h1>
          <p className="text-gray-600 mb-8">
            {message}
          </p>
          <button
            onClick={goToScoreboard}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            suppressHydrationWarning
          >
            Voir le classement
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erreur
          </h1>
          <p className="text-gray-600">
            Impossible de charger la question
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Question {question.order}
            </h1>
            <div className="text-sm text-gray-500">
              Session: {sessionId.slice(-8)}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.title}
            </h2>

            {hints.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Indices :</h3>
                <ul className="space-y-1">
                  {hints.map((hint, index) => (
                    <li key={index} className="text-yellow-700">
                      {index + 1}. {hint.hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse
                </label>
                <input
                  type="text"
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Tapez votre réponse..."
                  required
                  disabled={submitting}
                  suppressHydrationWarning
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!answer.trim() || submitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  suppressHydrationWarning
                >
                  {submitting ? 'Validation...' : 'Valider'}
                </button>

                {hints.length < question.hints.length && (
                  <button
                    type="button"
                    onClick={getHint}
                    className="px-6 py-3 border border-yellow-400 text-yellow-700 rounded-lg font-medium hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                    suppressHydrationWarning
                  >
                    Indice ({hints.length + 1}/{question.hints.length})
                  </button>
                )}
              </div>
            </form>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.includes('Bonne') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

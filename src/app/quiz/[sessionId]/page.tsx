'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Question {
  id: string;
  order: number;
  title: string;
  hints: string[];
  userPseudo?: string;
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
  const [completed, setCompleted] = useState(false);
  const [hintModalOpen, setHintModalOpen] = useState(false);

  // Classe Tailwind pour les toasts de la page quiz - positionnés au-dessus du footer
  const quizToastClass = "transform -translate-y-22";

  const loadCurrentQuestion = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/current-question`);
      const data = await response.json();

      if (data.completed) {
        setCompleted(true);
        toast.success(data.message, {
          className: quizToastClass
        });
      } else {
        setQuestion(data);
        setHints([]);
        setAnswer('');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('Erreur lors du chargement de la question', {
        className: quizToastClass
      });
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
      
      if (data.isCorrect) {
        toast.success(data.message, {
          className: quizToastClass
        });
        if (data.completed) {
          setCompleted(true);
        } else {
          // Passer à la question suivante après un délai
          setTimeout(() => {
            loadCurrentQuestion();
          }, 1500);
        }
      } else {
        toast.error(data.message, {
          className: quizToastClass
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Erreur lors de la soumission de la réponse', {
        className: quizToastClass
      });
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
        setHintModalOpen(true);
      } else {
        toast.error(data.error, {
          className: quizToastClass
        });
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error('Erreur lors de la récupération de l\'indice', {
        className: quizToastClass
      });
    }
  };

  const goToScoreboard = () => {
    router.push('/scoreboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-violet-100">Chargement...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Félicitations !
          </h1>
          <p className="text-gray-600 mb-8">
            Vous avez terminé le quiz !
          </p>
          <Button
            onClick={goToScoreboard}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Voir le classement
          </Button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 relative">
      {/* Header avec pseudo */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="text-violet-200 text-sm font-medium bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
            👤 {question.userPseudo}
          </div>
          <div className="text-violet-200 text-sm font-medium bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
            Question {question.order}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="min-h-screen flex flex-col pt-20 pb-32 px-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 leading-relaxed">
              {question.title}
            </h1>

            {/* Bouton d'indice centré */}
            {hints.length < question.hints.length && (
              <div className="text-center mb-8">
                <Dialog open={hintModalOpen} onOpenChange={setHintModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={getHint}
                      variant="outline"
                      className="bg-yellow-500/20 border-yellow-400/50 text-yellow-200 hover:bg-yellow-400/30 hover:text-yellow-100"
                    >
                      💡 Indice ({hints.length + 1}/{question.hints.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-yellow-50 border-yellow-200">
                    <DialogHeader>
                      <DialogTitle className="text-yellow-800">💡 Indice #{hints.length}</DialogTitle>
                      <DialogDescription className="text-yellow-700 text-base font-medium">
                        {hints[hints.length - 1]?.hint}
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>

        {/* Zone de saisie fixée en bas */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-violet-200/50 shadow-2xl p-4">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="flex-1 h-14 bg-white border-violet-300/50 text-slate-900 placeholder:text-violet-600/60 text-lg font-medium focus:border-violet-400 focus:ring-2 focus:ring-violet-400/70 rounded-xl"
                placeholder="Votre réponse..."
                required
                disabled={submitting}
              />
              <Button
                type="submit"
                disabled={!answer.trim() || submitting}
                className="h-14 px-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-lg"
              >
                {submitting ? 'Validation...' : 'Valider'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

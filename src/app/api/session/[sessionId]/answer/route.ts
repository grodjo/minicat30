import { NextRequest, NextResponse } from 'next/server';
import { validateAnswer, completeSession, getCurrentQuestion } from '@/lib/game';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const { questionId, answer } = await request.json();

    if (!sessionId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const result = await validateAnswer(sessionId, questionId, answer);

    // Si la réponse est correcte, vérifier si c'est la dernière question
    if (result.isCorrect) {
      const nextQuestion = await getCurrentQuestion(sessionId);
      
      if (!nextQuestion) {
        // Toutes les questions ont été répondues, terminer la session
        await completeSession(sessionId);
        return NextResponse.json({
          isCorrect: true,
          completed: true,
          message: 'Félicitations ! Vous avez terminé le quiz !'
        });
      }
    }

    return NextResponse.json({
      isCorrect: result.isCorrect,
      completed: false,
      message: result.isCorrect 
        ? 'Bonne réponse !' 
        : 'Réponse incorrecte. Essayez encore.'
    });

  } catch (error) {
    console.error('Error validating answer:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation de la réponse' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentQuestion, getSessionWithUser } from '@/lib/game';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session requis' },
        { status: 400 }
      );
    }

    const question = await getCurrentQuestion(sessionId);
    const session = await getSessionWithUser(sessionId);

    if (!question) {
      return NextResponse.json(
        { completed: true, message: 'Quiz terminé!' },
        { status: 200 }
      );
    }

    // Renvoyer la question avec le pseudo de l'utilisateur
    return NextResponse.json({
      id: question.id,
      order: question.order,
      title: question.title,
      hints: question.hints,
      userPseudo: session?.userId?.pseudo || 'Anonyme'
    });

  } catch (error) {
    console.error('Error getting current question:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la question' },
      { status: 500 }
    );
  }
}

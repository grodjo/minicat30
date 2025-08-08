import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStep, getSessionWithUser } from '@/lib/game';

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

    const [step, session] = await Promise.all([
      getCurrentStep(sessionId),
      getSessionWithUser(sessionId)
    ]);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Session inconnue' },
        { status: 404 }
      );
    }

    if (!step) {
      return NextResponse.json(
        { completed: true, message: 'Quiz terminé!' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      stepName: step.stepName,
      order: step.order,
      title: step.title,
      hints: step.hints,
      pseudo: session.user.pseudo,
      startedAt: session.startedAt.toISOString()
    });

  } catch (error) {
    console.error('Error getting current step:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'étape" },
      { status: 500 }
    );
  }
}

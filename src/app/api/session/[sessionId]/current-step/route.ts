import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStepWithSubStep, getSessionWithUser } from '@/lib/game';
import { getSubStepData } from '@/lib/steps';

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

    const [stepData, session] = await Promise.all([
      getCurrentStepWithSubStep(sessionId),
      getSessionWithUser(sessionId)
    ]);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Session inconnue' },
        { status: 404 }
      );
    }

    if (!stepData) {
      return NextResponse.json(
        { completed: true, message: 'Toutes les étapes terminées!' },
        { status: 200 }
      );
    }

    const { step, stepSession, currentSubStep } = stepData;
    const subStepData = getSubStepData(step, currentSubStep);

    // Si la sous-étape actuelle n'est pas disponible, il y a un problème
    if (!subStepData) {
      return NextResponse.json(
        { error: 'Sous-étape non disponible pour cette étape' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      stepName: step.name,
      stepRank: step.stepRank,
      currentSubStep,
      subStepData,
      stepSession: {
        directionCompleted: !!stepSession.directionCompletedAt,
        enigmaCompleted: !!stepSession.enigmaCompletedAt,
        bonusCompleted: !!stepSession.bonusAttemptedAt,
        bonusCorrect: stepSession.isBonusCorrect,
        keyCompleted: !!stepSession.keyCompletedAt,
        hasUsedHint: stepSession.hasUsedHint,
        enigmaAttemptsCount: stepSession.enigmaAttemptsCount,
        penaltyTimeMs: stepSession.penaltyTimeMs,
        currentHintIndex: stepSession.currentHintIndex
      },
      totalHints: step.enigma?.hints.length || 0, // Ajouter le nombre total d'indices
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

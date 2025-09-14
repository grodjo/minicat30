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
        hasUsedHint: stepSession.directionHintIndex > 0 || stepSession.enigmaHintIndex > 0,
        enigmaAttemptsCount: stepSession.enigmaAttemptsCount,
        penaltyTimeMs: stepSession.penaltyTimeMs,
        currentHintIndex: (() => {
          const currentSubStep = stepSession.currentSubStep;
          if (currentSubStep === 'direction') {
            return stepSession.directionHintIndex;
          } else if (currentSubStep === 'enigma' || currentSubStep === 'final') {
            return stepSession.enigmaHintIndex;
          }
          return 0; // fallback
        })()
      },
      totalHints: (() => {
        const currentSubStep = stepSession.currentSubStep;
        if (currentSubStep === 'direction' && step.direction?.hints) {
          return step.direction.hints.length;
        } else if ((currentSubStep === 'enigma' || currentSubStep === 'final') && step.enigma?.hints) {
          return step.enigma.hints.length;
        }
        return 0;
      })(),
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

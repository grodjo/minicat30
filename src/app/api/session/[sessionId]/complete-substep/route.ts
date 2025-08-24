import { NextRequest, NextResponse } from 'next/server';
import { completeSubStep } from '@/lib/game';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const { stepName, subStepType, data } = await request.json();

    if (!sessionId || !stepName || !subStepType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const validSubSteps = ['direction', 'enigma', 'bonus', 'key'];
    if (!validSubSteps.includes(subStepType)) {
      return NextResponse.json(
        { error: 'Type de sous-étape invalide' },
        { status: 400 }
      );
    }

    await completeSubStep(sessionId, stepName, subStepType, data);

    return NextResponse.json({
      success: true,
      message: `Sous-étape ${subStepType} complétée`
    });

  } catch (error) {
    console.error('Error completing substep:', error);
    return NextResponse.json(
      { error: "Erreur lors de la completion de la sous-étape" },
      { status: 500 }
    );
  }
}

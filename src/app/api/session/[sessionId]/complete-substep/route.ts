import { NextRequest, NextResponse } from 'next/server';
import { completeSubStep, addTimePenaltyToDatabase } from '@/lib/game';
import { getStepCorrectAnswer } from '@/lib/steps-logic';

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

    const validSubSteps = ['direction', 'moving', 'enigma', 'bonus', 'key'];
    if (!validSubSteps.includes(subStepType)) {
      return NextResponse.json(
        { error: 'Type de sous-étape invalide' },
        { status: 400 }
      );
    }

    // Si c'est un "donner sa langue au chat", ajouter une pénalité de 5 minutes
    if (data?.giveUp === true) {
      await addTimePenaltyToDatabase(sessionId, stepName, 5);
    }

    await completeSubStep(sessionId, stepName, subStepType, data);

    // Obtenir la réponse correcte pour la retourner au client si nécessaire
    const correctAnswer = getStepCorrectAnswer(stepName, subStepType);

    return NextResponse.json({
      success: true,
      message: `Sous-étape ${subStepType} complétée`,
      correctAnswer
    });

  } catch (error) {
    console.error('Error completing substep:', error);
    return NextResponse.json(
      { error: "Erreur lors de la completion de la sous-étape" },
      { status: 500 }
    );
  }
}

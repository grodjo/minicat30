import { NextRequest, NextResponse } from 'next/server';
import { addHintUsage, getCurrentStepWithSubStep } from '@/lib/game';
import { getStepByName, isLastStep, getFinalStep } from '@/lib/steps';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const { stepName, hintIndex } = await request.json();

    if (!sessionId || !stepName || typeof hintIndex !== 'number') {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Récupérer les données de l'étape actuelle pour déterminer si c'est l'étape finale
    const currentStepData = await getCurrentStepWithSubStep(sessionId);
    
    let step;
    
    if (currentStepData && isLastStep(currentStepData.stepSession.stepRank)) {
      // C'est l'étape finale, utiliser getFinalStep()
      step = getFinalStep();
    } else {
      // Étape normale
      step = getStepByName(stepName);
    }
    
    if (!step) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 404 }
      );
    }

    // Dans la nouvelle structure, il n'y a qu'un seul hint
    if (hintIndex !== 0) {
      return NextResponse.json(
        { error: "Index d'indice invalide" },
        { status: 400 }
      );
    }

    if (!step.enigma) {
      return NextResponse.json(
        { error: 'Cette étape n\'a pas d\'énigme avec indice' },
        { status: 400 }
      );
    }

    await addHintUsage(sessionId, stepName);

    return NextResponse.json({
      hint: step.enigma.hint,
      hintIndex: 0,
      totalHints: 1
    });

  } catch (error) {
    console.error('Error getting hint:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'indice" },
      { status: 500 }
    );
  }
}

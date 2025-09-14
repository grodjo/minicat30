import { NextRequest, NextResponse } from 'next/server';
import { addHintPenalty, getCurrentStepWithSubStep } from '@/lib/game';
import { getStepByOrder, isLastStep, getFinalStep } from '@/lib/steps';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Récupérer les données de l'étape actuelle pour déterminer si c'est l'étape finale
    const currentStepData = await getCurrentStepWithSubStep(sessionId);
    
    if (!currentStepData) {
      return NextResponse.json(
        { error: 'Étape actuelle non trouvée' },
        { status: 404 }
      );
    }

    let step;
    
    if (isLastStep(currentStepData.stepSession.stepRank)) {
      // C'est l'étape finale, utiliser getFinalStep()
      step = getFinalStep();
    } else {
      // Étape normale, utiliser le stepRank pour récupérer l'étape
      step = getStepByOrder(currentStepData.stepSession.stepRank);
    }
    
    console.log('Debug hint API:');
    console.log('- stepRank:', currentStepData.stepSession.stepRank);
    console.log('- step:', step);
    console.log('- step.enigma:', step?.enigma);
    console.log('- step.enigma.hints:', step?.enigma?.hints);
    
    if (!step || !step.enigma || !step.enigma.hints) {
      return NextResponse.json(
        { error: 'Cette étape n\'a pas d\'énigme avec indices' },
        { status: 400 }
      );
    }

    // Vérifier l'index d'indice actuel
    const currentHintIndex = currentStepData.stepSession.currentHintIndex;
    
    // Vérifier s'il y a encore des indices disponibles
    if (currentHintIndex >= step.enigma.hints.length) {
      return NextResponse.json(
        { error: 'Tous les indices ont déjà été utilisés' },
        { status: 400 }
      );
    }

    // Ajouter la pénalité et incrémenter l'index
    await addHintPenalty(sessionId, step.name);

    return NextResponse.json({
      hint: step.enigma.hints[currentHintIndex],
      hintIndex: currentHintIndex,
      totalHints: step.enigma.hints.length,
      remainingHints: step.enigma.hints.length - currentHintIndex - 1
    });

  } catch (error) {
    console.error('Error getting hint:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'indice" },
      { status: 500 }
    );
  }
}

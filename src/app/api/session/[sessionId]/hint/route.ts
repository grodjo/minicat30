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
    console.log('- currentSubStep:', currentStepData.stepSession.currentSubStep);
    console.log('- step:', step);
    console.log('- step.direction:', step?.direction);
    console.log('- step.enigma:', step?.enigma);
    
    if (!step) {
      return NextResponse.json(
        { error: 'Étape introuvable' },
        { status: 404 }
      );
    }
    
    // Détermine quels hints utiliser selon la sous-étape actuelle
    const currentSubStep = currentStepData.stepSession.currentSubStep;
    let hints: string[] = [];
    
    if (currentSubStep === 'direction' && step.direction?.hints) {
      hints = step.direction.hints;
    } else if ((currentSubStep === 'enigma' || currentSubStep === 'final') && step.enigma?.hints) {
      hints = step.enigma.hints;
    }
    
    if (hints.length === 0) {
      return NextResponse.json(
        { error: 'Cette sous-étape n\'a pas d\'indices disponibles' },
        { status: 400 }
      );
    }

    // Vérifier l'index d'indice actuel selon la sous-étape
    let currentHintIndex: number;
    if (currentSubStep === 'direction') {
      currentHintIndex = currentStepData.stepSession.directionHintIndex;
    } else if (currentSubStep === 'enigma' || currentSubStep === 'final') {
      currentHintIndex = currentStepData.stepSession.enigmaHintIndex;
    } else {
      currentHintIndex = 0; // fallback
    }
    
    // Vérifier s'il y a encore des indices disponibles
    if (currentHintIndex >= hints.length) {
      return NextResponse.json(
        { error: 'Tous les indices ont déjà été utilisés' },
        { status: 400 }
      );
    }

    // Ajouter la pénalité et incrémenter l'index
    await addHintPenalty(sessionId, step.name);

    return NextResponse.json({
      hint: hints[currentHintIndex],
      hintIndex: currentHintIndex,
      totalHints: hints.length,
      remainingHints: hints.length - currentHintIndex - 1
    });

  } catch (error) {
    console.error('Error getting hint:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'indice" },
      { status: 500 }
    );
  }
}

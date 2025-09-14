import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStepWithSubStep } from '@/lib/game';
import { getStepByName, isLastStep, getFinalStep } from '@/lib/steps';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string; hintIndex: string }> }
) {
  try {
    const { sessionId, hintIndex } = await context.params;
    const hintIndexNum = parseInt(hintIndex);

    if (isNaN(hintIndexNum)) {
      return NextResponse.json(
        { error: 'Index d\'indice invalide' },
        { status: 400 }
      );
    }

    const currentStepData = await getCurrentStepWithSubStep(sessionId);
    
    if (!currentStepData) {
      return NextResponse.json(
        { error: 'Session introuvable ou terminée' },
        { status: 404 }
      );
    }

    const { step: currentStep } = currentStepData;
    const stepName = currentStep.name;
    
    // Déterminer quelle étape contient l'énigme
    let step;
    if (isLastStep(currentStep.stepRank)) {
      // Étape finale
      step = getFinalStep();
    } else {
      // Étape normale
      step = getStepByName(stepName);
    }
    
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

    // Vérifier que l'index d'indice est valide
    if (hintIndexNum >= hints.length) {
      return NextResponse.json(
        { error: 'Index d\'indice invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'indice a été débloqué selon la sous-étape
    let currentHintIndex: number;
    if (currentSubStep === 'direction') {
      currentHintIndex = currentStepData.stepSession.directionHintIndex;
    } else if (currentSubStep === 'enigma' || currentSubStep === 'final') {
      currentHintIndex = currentStepData.stepSession.enigmaHintIndex;
    } else {
      currentHintIndex = 0; // fallback
    }

    if (hintIndexNum >= currentHintIndex) {
      return NextResponse.json(
        { error: 'Cet indice n\'a pas encore été débloqué' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      hint: hints[hintIndexNum],
      hintIndex: hintIndexNum,
      totalHints: hints.length
    });

  } catch (error) {
    console.error('Error getting specific hint:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'indice" },
      { status: 500 }
    );
  }
}

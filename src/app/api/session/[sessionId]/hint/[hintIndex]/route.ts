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
    
    if (!step || !step.enigma || !step.enigma.hints) {
      return NextResponse.json(
        { error: 'Cette étape n\'a pas d\'énigme avec indices' },
        { status: 400 }
      );
    }

    // Vérifier que l'index d'indice est valide
    if (hintIndexNum >= step.enigma.hints.length) {
      return NextResponse.json(
        { error: 'Index d\'indice invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'indice a été débloqué
    if (hintIndexNum >= currentStepData.stepSession.currentHintIndex) {
      return NextResponse.json(
        { error: 'Cet indice n\'a pas encore été débloqué' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      hint: step.enigma.hints[hintIndexNum],
      hintIndex: hintIndexNum,
      totalHints: step.enigma.hints.length
    });

  } catch (error) {
    console.error('Error getting specific hint:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'indice" },
      { status: 500 }
    );
  }
}

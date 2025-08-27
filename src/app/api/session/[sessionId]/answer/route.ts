import { NextRequest, NextResponse } from 'next/server';
import { completeSubStep, completeSession, getCurrentStepWithSubStep } from '@/lib/game';
import { validateStepAnswer } from '@/lib/steps';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const { stepName, answer, subStepType } = await request.json();

    if (!sessionId || !stepName || !answer || !subStepType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Valider la réponse selon le type de sous-étape
    const isCorrect = validateStepAnswer(stepName, subStepType, answer);

    if (isCorrect) {
      // Marquer la sous-étape comme complétée
      await completeSubStep(sessionId, stepName, subStepType, { isCorrect: true });

      // Vérifier si toutes les étapes sont terminées
      const nextStepData = await getCurrentStepWithSubStep(sessionId);
      
      if (!nextStepData) {
        // Toutes les étapes ont été complétées, terminer la session
        await completeSession(sessionId);
        return NextResponse.json({
          isCorrect: true,
          completed: true,
          message: 'Félicitations ! Vous avez terminé toutes les étapes !'
        });
      }
    } else if (subStepType === 'bonus') {
      // Pour les bonus, même si incorrect, marquer comme tenté et passer à l'étape suivante
      await completeSubStep(sessionId, stepName, subStepType, { isCorrect: false });
      
      // Vérifier si toutes les étapes sont terminées après ce bonus raté
      const nextStepData = await getCurrentStepWithSubStep(sessionId);
      
      if (!nextStepData) {
        // Toutes les étapes ont été complétées, terminer la session
        await completeSession(sessionId);
        return NextResponse.json({
          isCorrect: false,
          completed: true,
          message: 'Quiz terminé ! Dommage pour cette question bonus.'
        });
      }
      
      return NextResponse.json({
        isCorrect: false,
        completed: false,
        message: 'Dommage ! Passons à la suite.',
        moveToNext: true // Indique au frontend de charger la prochaine étape
      });
    }

    return NextResponse.json({
      isCorrect,
      completed: false,
      message: isCorrect 
        ? 'Bonne réponse !' 
        : 'Réponse incorrecte. Essayez encore.'
    });

  } catch (error) {
    console.error('Error validating answer:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation de la réponse' },
      { status: 500 }
    );
  }
}

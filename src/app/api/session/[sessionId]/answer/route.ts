import { NextRequest, NextResponse } from 'next/server';
import { completeSubStep, completeSession, getCurrentStepWithSubStep, addEnigmaAttempt, addKeyPenalty, MAX_ENIGMA_ATTEMPTS } from '@/lib/game';
import { validateStepAnswer, validateFinalStepAnswer, isLastStep, getStepCorrectAnswer } from '@/lib/steps-logic';

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

    // Récupérer les données de l'étape actuelle pour déterminer si c'est l'étape finale
    const currentStepData = await getCurrentStepWithSubStep(sessionId);
    
    let isCorrect = false;
    
    if (currentStepData && isLastStep(currentStepData.stepSession.stepRank)) {
      // C'est l'étape finale, utiliser la validation spéciale
      isCorrect = validateFinalStepAnswer(subStepType, answer);
    } else {
      // Étape normale (inclut maintenant les clés)
      isCorrect = validateStepAnswer(stepName, subStepType, answer);
    }

    if (isCorrect) {
      // Marquer la sous-étape comme complétée
      // Pour les clés, passer la réponse dans les données
      const dataToPass = subStepType === 'key' ? { isCorrect: true, key: answer } : { isCorrect: true };
      await completeSubStep(sessionId, stepName, subStepType, dataToPass);

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
      
      // Obtenir la réponse correcte
      const correctAnswer = getStepCorrectAnswer(stepName, subStepType);
      
      // Vérifier si toutes les étapes sont terminées après ce bonus raté
      const nextStepData = await getCurrentStepWithSubStep(sessionId);
      
      if (!nextStepData) {
        // Toutes les étapes ont été complétées, terminer la session
        await completeSession(sessionId);
        return NextResponse.json({
          isCorrect: false,
          completed: true,
          message: 'Quiz terminé ! Dommage pour cette question bonus.',
          correctAnswer
        });
      }
      
      return NextResponse.json({
        isCorrect: false,
        completed: false,
        message: 'Dommage ! Passons à la suite.',
        moveToNext: true, // Indique au frontend de charger la prochaine étape
        correctAnswer
      });
    } else if (subStepType === 'enigma' || subStepType === 'final') {
      // Pour les énigmes, ajouter une tentative et une pénalité
      const updatedStepSession = await addEnigmaAttempt(sessionId, stepName);
      
      // Vérifier si le joueur a atteint le maximum de tentatives
      if (updatedStepSession.enigmaAttemptsCount >= MAX_ENIGMA_ATTEMPTS) {
        // Forcer la completion de l'énigme en échec
        await completeSubStep(sessionId, stepName, subStepType, { isCorrect: false });
        
        // Obtenir la réponse correcte
        const correctAnswer = getStepCorrectAnswer(stepName, subStepType);
        
        // Vérifier si toutes les étapes sont terminées
        const nextStepData = await getCurrentStepWithSubStep(sessionId);
        
        if (!nextStepData) {
          // Toutes les étapes ont été complétées, terminer la session
          await completeSession(sessionId);
          return NextResponse.json({
            isCorrect: false,
            completed: true,
            message: 'Quiz terminé ! Nombre maximum de tentatives atteint.',
            attemptsCount: updatedStepSession.enigmaAttemptsCount,
            maxAttempts: MAX_ENIGMA_ATTEMPTS,
            playSound: subStepType === 'final' ? 'alarmEnd' : 'scratchStop',
            correctAnswer
          });
        }
        
        return NextResponse.json({
          isCorrect: false,
          completed: false,
          message: 'Nombre maximum de tentatives atteint. Passons à la suite.',
          moveToNext: true,
          attemptsCount: updatedStepSession.enigmaAttemptsCount,
          maxAttempts: MAX_ENIGMA_ATTEMPTS,
          playSound: subStepType === 'final' ? 'alarmEnd' : 'scratchStop',
          correctAnswer
        });
      }
      
      return NextResponse.json({
        isCorrect: false,
        completed: false,
        message: `Réponse incorrecte. Il vous reste ${MAX_ENIGMA_ATTEMPTS - updatedStepSession.enigmaAttemptsCount} tentative(s).`,
        attemptsCount: updatedStepSession.enigmaAttemptsCount,
        maxAttempts: MAX_ENIGMA_ATTEMPTS
      });
    } else if (subStepType === 'key' && !isCorrect) {
      // Pour les clés incorrectes, ajouter une pénalité de 5 minutes
      await addKeyPenalty(sessionId, stepName);
      
      // Obtenir la réponse correcte
      const correctAnswer = getStepCorrectAnswer(stepName, subStepType);
      
      return NextResponse.json({
        isCorrect: false,
        completed: false,
        message: 'Chiffre incorrect ! Pénalité de 5 minutes appliquée.',
        correctAnswer
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

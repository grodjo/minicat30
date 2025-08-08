import { NextRequest, NextResponse } from 'next/server';
import { addHintUsage } from '@/lib/game';
import { getQuestionByStepName } from '@/lib/questions';

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

    const question = getQuestionByStepName(stepName);
    if (!question) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 404 }
      );
    }

    if (hintIndex < 0 || hintIndex >= question.hints.length) {
      return NextResponse.json(
        { error: "Index d'indice invalide" },
        { status: 400 }
      );
    }

    await addHintUsage(sessionId, stepName, hintIndex);

    return NextResponse.json({
      hint: question.hints[hintIndex],
      hintIndex,
      totalHints: question.hints.length
    });

  } catch (error) {
    console.error('Error getting hint:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'indice" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { addTimePenaltyToDatabase } from '@/lib/game';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const { stepName, penaltyMinutes } = await request.json();

    if (!sessionId || !stepName || typeof penaltyMinutes !== 'number') {
      return NextResponse.json(
        { error: 'Paramètres manquants ou invalides' },
        { status: 400 }
      );
    }

    await addTimePenaltyToDatabase(sessionId, stepName, penaltyMinutes);

    return NextResponse.json({
      success: true,
      message: `Pénalité de ${penaltyMinutes} minute(s) ajoutée`
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de pénalité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la pénalité' },
      { status: 500 }
    );
  }
}
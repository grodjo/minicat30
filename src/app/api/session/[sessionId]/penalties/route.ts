import { NextRequest, NextResponse } from 'next/server';
import { getSessionTotalPenalties, getSessionTotalBonusTime } from '@/lib/game';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session manquant' },
        { status: 400 }
      );
    }

    const totalPenaltyTimeMs = await getSessionTotalPenalties(sessionId);
    const totalBonusTimeMs = await getSessionTotalBonusTime(sessionId);

    return NextResponse.json({
      totalPenaltyTimeMs,
      totalBonusTimeMs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pénalités:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
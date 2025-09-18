import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;

    // Récupérer la session avec tous les détails nécessaires
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        stepSessions: true
      }
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // ✅ NOUVEAU: Calculer le temps effectif de la session (durée réelle sans pénalités)
    const effectiveTimeMs = gameSession.completedAt && gameSession.startedAt 
      ? gameSession.completedAt.getTime() - gameSession.startedAt.getTime()
      : 0;

    // ✅ NOUVEAU: Calculer le temps de pénalité total depuis les stepSessions (en millisecondes)
    const totalPenaltyMs = gameSession.stepSessions.reduce((sum, ss) => sum + ss.penaltyTimeMs, 0);

    // ✅ NOUVEAU: Calculer le temps total final (effectif + pénalités) comme dans le scoreboard
    const totalTimeMs = effectiveTimeMs + totalPenaltyMs;

    // Calculer les statistiques des questions bonus
    const bonusSteps = gameSession.stepSessions.filter(ss => ss.bonusAttemptedAt !== null);
    const bonusSuccessCount = bonusSteps.filter(ss => ss.isBonusCorrect === true).length;
    const bonusTotalCount = bonusSteps.length;
    const bonusSuccessRate = bonusTotalCount > 0 ? Math.round((bonusSuccessCount / bonusTotalCount) * 100) : 0;

    // Compter le nombre total de tentatives d'énigmes incorrectes
    const totalEnigmaAttempts = gameSession.stepSessions.reduce((sum, ss) => sum + ss.enigmaAttemptsCount, 0);

    const summary = {
      sessionId: gameSession.id,
      pseudo: gameSession.user.pseudo,
      totalTimeMs,
      effectiveTimeMs,
      penaltyTimeMs: totalPenaltyMs,
      enigmaAttempts: totalEnigmaAttempts,
      bonusStats: {
        successCount: bonusSuccessCount,
        totalCount: bonusTotalCount,
        successRate: bonusSuccessRate
      },
      completedAt: gameSession.completedAt
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching session summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getScoreboard } from '@/lib/game';

export async function GET() {
  try {
    const scoreboard = await getScoreboard();

    const formattedScoreboard = scoreboard.map((score, index) => ({
      rank: index + 1,
      pseudo: score.pseudo,
      totalTime: formatTime(score.totalTime),
      totalTimeMs: score.totalTime,
      totalBonusCorrect: score.totalBonusCorrect,
      totalBonusAvailable: score.totalBonusAvailable,
      completedAt: score.completedAt,
      steps: score.steps.map(step => ({
        stepName: step.stepName,
        timeSpent: formatTime(step.timeSpent),
        timeSpentMs: step.timeSpent,
        penaltyTime: formatTime(step.penaltyTime),
        penaltyTimeMs: step.penaltyTime,
        bonusTime: formatTime(step.bonusTime),
        bonusTimeMs: step.bonusTime,
        bonusCorrect: step.bonusCorrect
      }))
    }));

    return NextResponse.json(formattedScoreboard);

  } catch (error) {
    console.error('Error getting scoreboard:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du tableau des scores' },
      { status: 500 }
    );
  }
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    if (remainingSeconds === 0) {
      return `${minutes}min`;
    }
    return `${minutes}min ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

import { NextResponse } from 'next/server';
import { getScoreboard } from '@/lib/game';

export async function GET() {
  try {
    const scoreboard = await getScoreboard();

    // Formater les temps pour l'affichage
    const formattedScoreboard = scoreboard.map((score, index) => ({
      rank: index + 1,
      pseudo: score.pseudo,
      totalTime: formatTime(score.totalTime),
      totalTimeMs: score.totalTime,
      totalHints: score.totalHints,
      completedAt: score.completedAt,
      attempts: score.attempts.map(attempt => ({
        questionId: attempt.questionId,
        timeSpent: formatTime(attempt.timeSpent),
        timeSpentMs: attempt.timeSpent,
        hintsUsed: attempt.hintsUsed
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
    return `${minutes}min ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

import { prisma } from './prisma';
import { getQuestionByOrder, getTotalQuestions } from './questions';

export async function createUser(pseudo: string) {
  return await prisma.user.create({
    data: { pseudo }
  });
}

export async function createGameSession(userId: string) {
  return await prisma.gameSession.create({
    data: {
      userId,
      startedAt: new Date()
    }
  });
}

export async function getCurrentQuestion(sessionId: string) {
  // Récupérer toutes les tentatives réussies de cette session
  const successfulAttempts = await prisma.attempt.findMany({
    where: {
      sessionId,
      isCorrect: true
    },
    orderBy: {
      answeredAt: 'asc'
    }
  });

  // La prochaine question est celle qui suit le nombre de bonnes réponses
  const nextQuestionOrder = successfulAttempts.length + 1;
  
  if (nextQuestionOrder > getTotalQuestions()) {
    return null; // Jeu terminé
  }

  return getQuestionByOrder(nextQuestionOrder);
}

export async function validateAnswer(sessionId: string, questionId: string, answer: string) {
  const question = await import('./questions').then(mod => mod.getQuestionById(questionId));
  
  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();

  // Créer une tentative
  const attempt = await prisma.attempt.create({
    data: {
      sessionId,
      questionId,
      startedAt: new Date(),
      answeredAt: new Date(),
      usedHints: '[]', // Sera mis à jour si des indices ont été utilisés
      isCorrect
    }
  });

  return { isCorrect, attempt };
}

export async function addHintUsage(sessionId: string, questionId: string, hintIndex: number) {
  // Trouver la tentative en cours pour cette question
  const currentAttempt = await prisma.attempt.findFirst({
    where: {
      sessionId,
      questionId,
      answeredAt: null
    },
    orderBy: {
      startedAt: 'desc'
    }
  });

  if (!currentAttempt) {
    // Créer une nouvelle tentative si aucune n'existe
    return await prisma.attempt.create({
      data: {
        sessionId,
        questionId,
        startedAt: new Date(),
        usedHints: JSON.stringify([hintIndex]),
        isCorrect: false
      }
    });
  }

  // Ajouter l'indice aux indices utilisés
  const usedHints = JSON.parse(currentAttempt.usedHints) as number[];
  if (!usedHints.includes(hintIndex)) {
    usedHints.push(hintIndex);
  }

  return await prisma.attempt.update({
    where: { id: currentAttempt.id },
    data: {
      usedHints: JSON.stringify(usedHints)
    }
  });
}

export async function completeSession(sessionId: string) {
  return await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date()
    }
  });
}

export async function getSessionStats(sessionId: string) {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      attempts: {
        where: { isCorrect: true },
        orderBy: { answeredAt: 'asc' }
      }
    }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const totalTime = session.completedAt 
    ? session.completedAt.getTime() - session.startedAt.getTime()
    : Date.now() - session.startedAt.getTime();

  return {
    user: session.user,
    totalTime,
    attempts: session.attempts,
    completedAt: session.completedAt
  };
}

export async function getScoreboard() {
  const completedSessions = await prisma.gameSession.findMany({
    where: {
      completedAt: { not: null }
    },
    include: {
      user: true,
      attempts: {
        where: { isCorrect: true },
        orderBy: { answeredAt: 'asc' }
      }
    },
    orderBy: {
      completedAt: 'asc' // Plus rapide en premier
    }
  });

  return completedSessions.map(session => {
    const totalTime = session.completedAt!.getTime() - session.startedAt.getTime();
    const totalHints = session.attempts.reduce((sum, attempt) => {
      const hints = JSON.parse(attempt.usedHints) as number[];
      return sum + hints.length;
    }, 0);

    return {
      pseudo: session.user.pseudo,
      totalTime,
      totalHints,
      completedAt: session.completedAt,
      attempts: session.attempts.map(attempt => ({
        questionId: attempt.questionId,
        timeSpent: attempt.answeredAt!.getTime() - attempt.startedAt.getTime(),
        hintsUsed: JSON.parse(attempt.usedHints).length
      }))
    };
  });
}

import { connectToDatabase } from './mongodb';
import { User, GameSession, Attempt } from './models';
import { getQuestionByOrder, getTotalQuestions } from './questions';

export async function createUser(pseudo: string) {
  await connectToDatabase();
  const user = new User({ pseudo });
  return await user.save();
}

export async function createGameSession(userId: string) {
  await connectToDatabase();
  const session = new GameSession({
    userId,
    startedAt: new Date()
  });
  return await session.save();
}

export async function getCurrentQuestion(sessionId: string) {
  await connectToDatabase();
  
  // Récupérer toutes les tentatives réussies de cette session
  const successfulAttempts = await Attempt.find({
    sessionId,
    isCorrect: true
  }).sort({ answeredAt: 1 });

  // La prochaine question est celle qui suit le nombre de bonnes réponses
  const nextQuestionOrder = successfulAttempts.length + 1;
  
  if (nextQuestionOrder > getTotalQuestions()) {
    return null; // Jeu terminé
  }

  return getQuestionByOrder(nextQuestionOrder);
}

export async function validateAnswer(sessionId: string, questionId: string, answer: string) {
  await connectToDatabase();
  
  const question = await import('./questions').then(mod => mod.getQuestionById(questionId));
  
  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();

  // Créer une tentative
  const attempt = new Attempt({
    sessionId,
    questionId,
    startedAt: new Date(),
    answeredAt: new Date(),
    usedHints: '[]', // Sera mis à jour si des indices ont été utilisés
    isCorrect
  });

  await attempt.save();

  return { isCorrect, attempt };
}

export async function addHintUsage(sessionId: string, questionId: string, hintIndex: number) {
  await connectToDatabase();
  
  // Trouver la tentative en cours pour cette question
  const currentAttempt = await Attempt.findOne({
    sessionId,
    questionId,
    answeredAt: null
  }).sort({ startedAt: -1 });

  if (!currentAttempt) {
    // Créer une nouvelle tentative si aucune n'existe
    const newAttempt = new Attempt({
      sessionId,
      questionId,
      startedAt: new Date(),
      usedHints: JSON.stringify([hintIndex]),
      isCorrect: false
    });
    return await newAttempt.save();
  }

  // Ajouter l'indice aux indices utilisés
  const usedHints = JSON.parse(currentAttempt.usedHints) as number[];
  if (!usedHints.includes(hintIndex)) {
    usedHints.push(hintIndex);
  }

  currentAttempt.usedHints = JSON.stringify(usedHints);
  return await currentAttempt.save();
}

export async function completeSession(sessionId: string) {
  await connectToDatabase();
  
  return await GameSession.findByIdAndUpdate(
    sessionId,
    { completedAt: new Date() },
    { new: true }
  );
}

export async function getSessionStats(sessionId: string) {
  await connectToDatabase();
  
  const session = await GameSession.findById(sessionId);
  const user = session ? await User.findById(session.userId) : null;
  const attempts = await Attempt.find({
    sessionId,
    isCorrect: true
  }).sort({ answeredAt: 1 });

  if (!session || !user) {
    throw new Error('Session not found');
  }

  const totalTime = session.completedAt 
    ? session.completedAt.getTime() - session.startedAt.getTime()
    : Date.now() - session.startedAt.getTime();

  return {
    user,
    totalTime,
    attempts,
    completedAt: session.completedAt
  };
}

export async function getScoreboard() {
  await connectToDatabase();
  
  const completedSessions = await GameSession.find({
    completedAt: { $ne: null }
  }).sort({ completedAt: 1 }); // Plus rapide en premier

  const scoreboardData = [];

  for (const session of completedSessions) {
    const user = await User.findById(session.userId);
    const attempts = await Attempt.find({
      sessionId: session._id.toString(),
      isCorrect: true
    }).sort({ answeredAt: 1 });

    if (!user || !session.completedAt) continue;

    const totalTime = session.completedAt.getTime() - session.startedAt.getTime();
    const totalHints = attempts.reduce((sum, attempt) => {
      const hints = JSON.parse(attempt.usedHints) as number[];
      return sum + hints.length;
    }, 0);

    scoreboardData.push({
      pseudo: user.pseudo,
      totalTime,
      totalHints,
      completedAt: session.completedAt,
      attempts: attempts.map(attempt => ({
        questionId: attempt.questionId,
        timeSpent: attempt.answeredAt!.getTime() - attempt.startedAt.getTime(),
        hintsUsed: JSON.parse(attempt.usedHints).length
      }))
    });
  }

  return scoreboardData;
}

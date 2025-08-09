import { prisma } from './prisma'
import { getQuestionByOrder, getQuestionByStepName, getTotalSteps } from './questions'

// Création utilisateur (échoue si le pseudo existe déjà – l'erreur Prisma P2002 est gérée côté API)
export async function createUser(pseudo: string) {
  return prisma.user.create({ data: { pseudo } })
}

// Création d'une nouvelle session de jeu
export async function createGameSession(userId: string) {
  return prisma.gameSession.create({ data: { userId } })
}

export async function getCurrentStep(sessionId: string) {
  // Compter le nombre de questions complétées via QuestionSession
  const completedQuestions = await prisma.questionSession.findMany({
    where: { gameSessionId: sessionId, answeredAt: { not: null } },
    select: { order: true },
    orderBy: { answeredAt: 'asc' }
  })
  
  const nextOrder = completedQuestions.length + 1
  if (nextOrder > getTotalSteps()) return null
  
  const question = getQuestionByOrder(nextOrder)
  if (!question) return null

  // Créer ou récupérer la QuestionSession pour cette question
  await prisma.questionSession.upsert({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName: question.stepName } },
    create: {
      gameSessionId: sessionId,
      stepName: question.stepName,
      order: question.order,
      startedAt: new Date()
    },
    update: {
      // Si elle existe déjà, on ne met pas à jour startedAt pour préserver le temps original
    }
  })

  return question
}

export async function validateAnswer(sessionId: string, stepName: string, answer: string) {
  const question = getQuestionByStepName(stepName)
  if (!question) throw new Error('Étape introuvable')

  const normalizedAnswer = answer.trim().toLowerCase()
  const normalizedExpected = question.answer.trim().toLowerCase()
  const isCorrect = normalizedAnswer === normalizedExpected

  // Récupérer la QuestionSession
  const questionSession = await prisma.questionSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!questionSession) {
    throw new Error('Session de question introuvable')
  }

  // Créer un nouvel Attempt lié à la QuestionSession
  await prisma.attempt.create({
    data: {
      questionSessionId: questionSession.id,
      submittedAt: new Date(),
      answer: answer.trim(),
      isCorrect
    }
  })

  // Si la réponse est correcte, marquer la QuestionSession comme terminée
  if (isCorrect) {
    await prisma.questionSession.update({
      where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } },
      data: { answeredAt: new Date() }
    })
  }

  return { isCorrect }
}

export async function addHintUsage(sessionId: string, stepName: string, hintIndex: number) {
  const question = getQuestionByStepName(stepName)
  if (!question) throw new Error('Étape introuvable')

  // Récupérer la QuestionSession pour cette question
  const questionSession = await prisma.questionSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!questionSession) {
    throw new Error('Session de question introuvable')
  }

  // Mettre à jour les indices utilisés
  const currentHints = Array.isArray(questionSession.usedHints) ? 
    (questionSession.usedHints as number[]) : []
  
  if (!currentHints.includes(hintIndex)) {
    const updatedHints = [...currentHints, hintIndex]
    await prisma.questionSession.update({
      where: { id: questionSession.id },
      data: { usedHints: updatedHints }
    })
    return { usedHints: updatedHints }
  }

  return { usedHints: currentHints }
}

export async function completeSession(sessionId: string) {
  return prisma.gameSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() }
  })
}

export async function getSessionStats(sessionId: string) {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      questionSessions: {
        include: {
          attempts: {
            where: { isCorrect: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })
  if (!session) throw new Error('Session introuvable')

  const attempts = session.questionSessions.map(qs => qs.attempts[0]).filter(Boolean)
  const totalTime = (session.completedAt?.getTime() || Date.now()) - session.startedAt.getTime()

  return { user: session.user, totalTime, attempts, completedAt: session.completedAt }
}

interface ScoreboardAttemptRow {
  stepName: string
  timeSpent: number
  hintsUsed: number
}
interface ScoreboardRow {
  pseudo: string
  totalTime: number
  totalHints: number
  completedAt: Date
  attempts: ScoreboardAttemptRow[]
}

export async function getScoreboard(): Promise<ScoreboardRow[]> {
  const sessions = await prisma.gameSession.findMany({
    where: { completedAt: { not: null } },
    include: {
      user: true,
      questionSessions: { 
        where: { answeredAt: { not: null } }, 
        orderBy: { answeredAt: 'asc' } 
      }
    }
  })

  const scoreboard = sessions.map((s: typeof sessions[number]): ScoreboardRow => {
    const totalTime = s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : 0
    const totalHints = s.questionSessions.reduce((sum: number, qs: typeof s.questionSessions[number]): number => {
      const arr = Array.isArray(qs.usedHints) ? (qs.usedHints as unknown as number[]) : []
      return sum + arr.length
    }, 0)
    
    return {
      pseudo: s.user.pseudo,
      totalTime,
      totalHints,
      completedAt: s.completedAt!,
      attempts: s.questionSessions.map((qs: typeof s.questionSessions[number]): ScoreboardAttemptRow => ({
        stepName: qs.stepName,
        timeSpent: qs.answeredAt && qs.startedAt ? qs.answeredAt.getTime() - qs.startedAt.getTime() : 0,
        hintsUsed: Array.isArray(qs.usedHints) ? (qs.usedHints as number[]).length : 0
      }))
    }
  })

  // Trier par temps total croissant (le plus rapide en premier)
  return scoreboard.sort((a, b) => a.totalTime - b.totalTime)
}

export async function getSessionWithUser(sessionId: string) {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { user: { select: { pseudo: true } } }
  })
  if (!session) throw new Error('SESSION_NOT_FOUND')
  if (!session.user) throw new Error('SESSION_USER_MISSING')
  return session
}

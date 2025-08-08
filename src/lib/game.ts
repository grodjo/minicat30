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
  // Compter le nombre de tentatives correctes pour déterminer l'ordre suivant
  const correctAttempts = await prisma.attempt.findMany({
    where: { sessionId, isCorrect: true },
    select: { stepName: true },
    orderBy: { answeredAt: 'asc' }
  })
  const nextOrder = correctAttempts.length + 1
  if (nextOrder > getTotalSteps()) return null
  return getQuestionByOrder(nextOrder)
}

export async function validateAnswer(sessionId: string, stepName: string, answer: string) {
  const question = getQuestionByStepName(stepName)
  if (!question) throw new Error('Étape introuvable')

  const normalizedAnswer = answer.trim().toLowerCase()
  const normalizedExpected = question.answer.trim().toLowerCase()
  const isCorrect = normalizedAnswer === normalizedExpected

  // Upsert de la tentative (clé composite unique sessionId + stepName)
  const existing = await prisma.attempt.findUnique({
    where: { sessionId_stepName: { sessionId, stepName } }
  })

  if (!existing) {
    await prisma.attempt.create({
      data: {
        sessionId,
        stepName,
        startedAt: new Date(),
        answeredAt: new Date(),
        isCorrect,
        usedHints: []
      }
    })
  } else if (existing.answeredAt === null || !existing.isCorrect) {
    // On ne réécrit la tentative que si elle n'était pas encore finalisée ou incorrecte
    await prisma.attempt.update({
      where: { id: existing.id },
      data: { answeredAt: new Date(), isCorrect }
    })
  }

  return { isCorrect }
}

export async function addHintUsage(sessionId: string, stepName: string, hintIndex: number) {
  const question = getQuestionByStepName(stepName)
  if (!question) throw new Error('Étape introuvable')

  const attempt = await prisma.attempt.upsert({
    where: { sessionId_stepName: { sessionId, stepName } },
    create: {
      sessionId,
      stepName,
      startedAt: new Date(),
      usedHints: [hintIndex],
      isCorrect: false
    },
    update: {}
  })

  // Garantir l'unicité des indices stockés
  const used = Array.isArray(attempt.usedHints) ? (attempt.usedHints as number[]) : []
  if (!used.includes(hintIndex)) {
    used.push(hintIndex)
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { usedHints: used }
    })
  }

  return { usedHints: used }
}

export async function completeSession(sessionId: string) {
  return prisma.gameSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() }
  })
}

export async function getSessionStats(sessionId: string) {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId }
  })
  if (!session) throw new Error('Session introuvable')
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) throw new Error('Utilisateur introuvable')

  const attempts = await prisma.attempt.findMany({
    where: { sessionId, isCorrect: true },
    orderBy: { answeredAt: 'asc' }
  })

  const totalTime = (session.completedAt?.getTime() || Date.now()) - session.startedAt.getTime()

  return { user, totalTime, attempts, completedAt: session.completedAt }
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
    orderBy: { completedAt: 'asc' },
    include: {
      user: true,
      attempts: { where: { isCorrect: true }, orderBy: { answeredAt: 'asc' } }
    }
  })

  return sessions.map((s: typeof sessions[number]): ScoreboardRow => {
    const totalTime = s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : 0
    const totalHints = s.attempts.reduce((sum: number, a: typeof s.attempts[number]): number => {
      const arr = Array.isArray(a.usedHints) ? (a.usedHints as unknown as number[]) : []
      return sum + arr.length
    }, 0)
    return {
      pseudo: s.user.pseudo,
      totalTime,
      totalHints,
      completedAt: s.completedAt!,
      attempts: s.attempts.map((a: typeof s.attempts[number]): ScoreboardAttemptRow => ({
        stepName: a.stepName,
        timeSpent: a.answeredAt && a.startedAt ? a.answeredAt.getTime() - a.startedAt.getTime() : 0,
        hintsUsed: Array.isArray(a.usedHints) ? (a.usedHints as number[]).length : 0
      }))
    }
  })
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

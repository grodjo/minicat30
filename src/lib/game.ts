import { prisma } from './prisma'
import { getStepByOrder, getStepByName, getTotalSteps } from './steps'

// Création utilisateur (échoue si le pseudo existe déjà – l'erreur Prisma P2002 est gérée côté API)
export async function createUser(pseudo: string) {
  return prisma.user.create({ data: { pseudo } })
}

// Création d'une nouvelle session de jeu
export async function createGameSession(userId: string) {
  return prisma.gameSession.create({ data: { userId } })
}

export async function getCurrentStep(sessionId: string) {
  // Compter le nombre d'étapes complétées via StepSession
  const completedSteps = await prisma.stepSession.findMany({
    where: { gameSessionId: sessionId, answeredAt: { not: null } },
    select: { stepRank: true },
    orderBy: { answeredAt: 'asc' }
  })
  
  const nextRank = completedSteps.length + 1
  if (nextRank > getTotalSteps()) return null
  
  const step = getStepByOrder(nextRank)
  if (!step) return null

  // Créer ou récupérer la StepSession pour cette étape
  await prisma.stepSession.upsert({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName: step.name } },
    create: {
      gameSessionId: sessionId,
      stepName: step.name,
      stepRank: nextRank,
      startedAt: new Date()
    },
    update: {
      // Si elle existe déjà, on ne met pas à jour startedAt pour préserver le temps original
    }
  })

  return step
}

export async function validateAnswer(sessionId: string, stepName: string, answer: string) {
  const step = getStepByName(stepName)
  if (!step) throw new Error('Étape introuvable')

  const normalizedAnswer = answer.trim().toLowerCase()
  const normalizedExpected = step.enigma.answer.trim().toLowerCase()
  const isCorrect = normalizedAnswer === normalizedExpected

  // Récupérer la StepSession
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  // Si la réponse est correcte, marquer la StepSession comme terminée
  if (isCorrect) {
    await prisma.stepSession.update({
      where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } },
      data: { answeredAt: new Date() }
    })
  }

  return { isCorrect }
}

export async function addHintUsage(sessionId: string, stepName: string) {
  const step = getStepByName(stepName)
  if (!step) throw new Error('Étape introuvable')

  // Récupérer la StepSession pour cette étape
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  // Marquer que l'indice a été utilisé (on ne suit plus les indices individuels)
  await prisma.stepSession.update({
    where: { id: stepSession.id },
    data: { hasUsedHint: true }
  })

  return { hasUsedHint: true }
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
      stepSessions: {
        orderBy: { stepRank: 'asc' }
      }
    }
  })
  if (!session) throw new Error('Session introuvable')

  // Créer des données d'attempt à partir des stepSessions
  const attempts = session.stepSessions.map(ss => ({
    id: ss.id,
    isCorrect: ss.enigmaCompletedAt !== null,
    timeTaken: ss.enigmaCompletedAt ? 
      (ss.enigmaCompletedAt.getTime() - ss.directionCompletedAt!.getTime()) / 1000 : 0,
    stepName: ss.stepName,
    hasUsedHint: ss.hasUsedHint,
    isBonusCorrect: ss.isBonusCorrect
  }))
  
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
      stepSessions: { 
        where: { enigmaCompletedAt: { not: null } }, 
        orderBy: { enigmaCompletedAt: 'asc' } 
      }
    }
  })

  const scoreboard = sessions.map((s): ScoreboardRow => {
    const totalTime = s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : 0
    const totalHints = s.stepSessions.reduce((sum: number, ss): number => {
      return sum + (ss.hasUsedHint ? 1 : 0)
    }, 0)
    
    return {
      pseudo: s.user.pseudo,
      totalTime,
      totalHints,
      completedAt: s.completedAt!,
      attempts: s.stepSessions.map((ss): ScoreboardAttemptRow => ({
        stepName: ss.stepName,
        timeSpent: ss.enigmaCompletedAt && ss.directionCompletedAt ? 
          ss.enigmaCompletedAt.getTime() - ss.directionCompletedAt.getTime() : 0,
        hintsUsed: ss.hasUsedHint ? 1 : 0
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

// Nouvelles fonctions pour gérer les sous-étapes

export async function getCurrentStepWithSubStep(sessionId: string) {
  // Chercher une StepSession en cours (pas encore complètement terminée)
  const currentStepSession = await prisma.stepSession.findFirst({
    where: { 
      gameSessionId: sessionId, 
      keyCompletedAt: null // Pas encore terminée complètement
    },
    orderBy: { stepRank: 'asc' }
  })

  if (currentStepSession) {
    const step = getStepByName(currentStepSession.stepName)
    if (!step) throw new Error('Étape introuvable')
    
    return {
      step,
      stepSession: currentStepSession,
      currentSubStep: currentStepSession.currentSubStep as 'direction' | 'enigma' | 'bonus' | 'key'
    }
  }

  // Sinon, créer la prochaine étape
  const completedSteps = await prisma.stepSession.findMany({
    where: { gameSessionId: sessionId, keyCompletedAt: { not: null } },
    select: { stepRank: true },
    orderBy: { stepRank: 'asc' }
  })
  
  const nextRank = completedSteps.length + 1
  if (nextRank > getTotalSteps()) return null
  
  const step = getStepByOrder(nextRank)
  if (!step) return null

  // Créer la nouvelle StepSession
  const stepSession = await prisma.stepSession.create({
    data: {
      gameSessionId: sessionId,
      stepName: step.name,
      stepRank: nextRank,
      currentSubStep: 'direction',
      hasUsedHint: false,
      isBonusCorrect: false
    }
  })

  return {
    step,
    stepSession,
    currentSubStep: 'direction' as const
  }
}

export async function completeSubStep(
  sessionId: string, 
  stepName: string, 
  subStepType: 'direction' | 'enigma' | 'bonus' | 'key', 
  data?: { isCorrect?: boolean; key?: string }
) {
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  const now = new Date()
  const updateData: {
    directionCompletedAt?: Date;
    enigmaCompletedAt?: Date;
    bonusAttemptedAt?: Date;
    isBonusCorrect?: boolean;
    keyCompletedAt?: Date;
    collectedKey?: string;
    currentSubStep?: string;
  } = {}

  switch (subStepType) {
    case 'direction':
      updateData.directionCompletedAt = now
      updateData.currentSubStep = 'enigma'
      break
    case 'enigma':
      updateData.enigmaCompletedAt = now
      updateData.currentSubStep = 'bonus'
      break
    case 'bonus':
      updateData.bonusAttemptedAt = now
      updateData.isBonusCorrect = data?.isCorrect || false
      updateData.currentSubStep = 'key'
      break
    case 'key':
      updateData.keyCompletedAt = now
      updateData.collectedKey = data?.key || ''
      // L'étape est maintenant complètement terminée
      break
  }

  return prisma.stepSession.update({
    where: { id: stepSession.id },
    data: updateData
  })
}

export async function getCollectedKeys(sessionId: string): Promise<string[]> {
  const stepSessions = await prisma.stepSession.findMany({
    where: { 
      gameSessionId: sessionId,
      collectedKey: { not: null }
    },
    select: { collectedKey: true },
    orderBy: { stepRank: 'asc' }
  })

  return stepSessions
    .map(ss => ss.collectedKey)
    .filter((key): key is string => key !== null)
}

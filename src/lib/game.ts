import { prisma } from './prisma'
import { getStepByOrder, getStepByName, getTotalSteps, isLastStep, getFinalStep, getAvailableSubSteps, getNextSubStep, TOTAL_BONUS_AVAILABLE } from './steps'

// Constants pour les pénalités
export const HINT_PENALTY_TIME_MS = 3 * 60 * 1000; // 3 minutes
export const WRONG_ANSWER_PENALTY_TIME_MS = 1 * 60 * 1000; // 1 minute
export const MAX_ENIGMA_ATTEMPTS = 10;

// Création utilisateur (échoue si le pseudo existe déjà – l'erreur Prisma P2002 est gérée côté API)
export async function createUser(pseudo: string) {
  return prisma.user.create({ data: { pseudo } })
}

// Vérifier s'il existe une session en cours pour ce pseudo
export async function findActiveSession(pseudo: string) {
  const user = await prisma.user.findUnique({
    where: { pseudo },
    include: {
      sessions: {
        where: { completedAt: null }, // Sessions non terminées
        orderBy: { startedAt: 'desc' }, // La plus récente en premier
        take: 1,
        include: {
          stepSessions: {
            where: { keyCompletedAt: null },
            take: 1
          }
        }
      }
    }
  })

  if (!user || user.sessions.length === 0) {
    return null
  }

  const activeSession = user.sessions[0]
  return {
    sessionId: activeSession.id,
    userId: user.id,
    pseudo: user.pseudo,
    hasActiveSteps: activeSession.stepSessions.length > 0
  }
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
  // Récupérer la StepSession pour déterminer si c'est l'étape finale
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  let step;
  let normalizedExpected;

  // Si c'est l'étape finale (dernière étape de la liste)
  if (isLastStep(stepSession.stepRank)) {
    step = getFinalStep();
    if (!step || !step.enigma) throw new Error('Étape finale introuvable ou sans énigme');
    normalizedExpected = step.enigma.answer.trim().toLowerCase();
  } else {
    step = getStepByName(stepName);
    if (!step || !step.enigma) throw new Error('Étape introuvable ou sans énigme');
    normalizedExpected = step.enigma.answer.trim().toLowerCase();
  }

  const normalizedAnswer = answer.trim().toLowerCase()
  const isCorrect = normalizedAnswer === normalizedExpected

  // Si la réponse est correcte, marquer la StepSession comme terminée
  if (isCorrect) {
    await prisma.stepSession.update({
      where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } },
      data: { answeredAt: new Date() }
    })
  }

  return { isCorrect }
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

interface ScoreboardStepRow {
  stepName: string
  timeSpent: number
  penaltyTime: number
  bonusCorrect: boolean
}
interface ScoreboardRow {
  pseudo: string
  totalTime: number
  totalBonusCorrect: number
  totalBonusAvailable: number
  completedAt: Date
  steps: ScoreboardStepRow[]
}

export async function getScoreboard(): Promise<ScoreboardRow[]> {
  const sessions = await prisma.gameSession.findMany({
    where: { completedAt: { not: null } },
    include: {
      user: true,
      stepSessions: { 
        where: { keyCompletedAt: { not: null } }, 
        orderBy: { stepRank: 'asc' } 
      }
    }
  })

  const scoreboard = sessions.map((s): ScoreboardRow => {
    // Calculer le temps de base (durée réelle de la session)
    const baseTime = s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : 0
    
    // Ajouter toutes les pénalités cumulées de toutes les étapes
    const totalPenalties = s.stepSessions.reduce((sum: number, ss): number => {
      return sum + ss.penaltyTimeMs
    }, 0)
    
    // Temps total = temps de base + pénalités
    const totalTime = baseTime + totalPenalties
    
    const totalBonusCorrect = s.stepSessions.reduce((sum: number, ss): number => {
      return sum + (ss.isBonusCorrect ? 1 : 0)
    }, 0)
    const totalBonusAvailable = TOTAL_BONUS_AVAILABLE
    
    return {
      pseudo: s.user.pseudo,
      totalTime,
      totalBonusCorrect,
      totalBonusAvailable,
      completedAt: s.completedAt!,
      steps: s.stepSessions.map((ss): ScoreboardStepRow => {
        // Calculer le temps total de l'étape depuis le début jusqu'à la fin
        const timeSpent = ss.keyCompletedAt && ss.startedAt ?
          ss.keyCompletedAt.getTime() - ss.startedAt.getTime() : 0
        
        // Utiliser le temps de pénalité stocké en base de données (indices + mauvaises réponses)
        const penaltyTime = ss.penaltyTimeMs
        
        return {
          stepName: isLastStep(ss.stepRank) ? 'Étape finale' : ss.stepName,
          timeSpent,
          penaltyTime,
          bonusCorrect: ss.isBonusCorrect || false
        }
      })
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
    const step = getStepByOrder(currentStepSession.stepRank);
    if (!step) throw new Error('Étape introuvable');
    
    return {
      step,
      stepSession: currentStepSession,
      currentSubStep: currentStepSession.currentSubStep as 'direction' | 'enigma' | 'bonus' | 'key' | 'final'
    }
  }

  // Sinon, créer la prochaine étape
  const completedSteps = await prisma.stepSession.findMany({
    where: { gameSessionId: sessionId, keyCompletedAt: { not: null } },
    select: { stepRank: true },
    orderBy: { stepRank: 'asc' }
  })
  
  const nextRank = completedSteps.length + 1
  
  // Si on a dépassé le nombre total d'étapes, le jeu est terminé
  if (nextRank > getTotalSteps()) return null
  
  const step = getStepByOrder(nextRank)
  if (!step) return null

  // Déterminer la première sous-étape disponible
  let initialSubStep: string;
  if (isLastStep(nextRank)) {
    // Pour l'étape finale, commencer par 'final' si elle a une énigme
    initialSubStep = step.enigma ? 'final' : 'direction';
  } else {
    // Pour les étapes normales, commencer par la première sous-étape disponible
    const availableSubSteps = getAvailableSubSteps(step);
    initialSubStep = availableSubSteps.length > 0 ? availableSubSteps[0] : 'direction';
  }

  // Créer la nouvelle StepSession
  const stepSession = await prisma.stepSession.create({
    data: {
      gameSessionId: sessionId,
      stepName: step.name,
      stepRank: nextRank,
      currentSubStep: initialSubStep,
      hasUsedHint: false,
      isBonusCorrect: false
    }
  })

  return {
    step,
    stepSession,
    currentSubStep: initialSubStep as 'direction' | 'final'
  }
}

export async function completeSubStep(
  sessionId: string, 
  stepName: string, 
  subStepType: 'direction' | 'enigma' | 'bonus' | 'key' | 'final', 
  data?: { isCorrect?: boolean; key?: string }
) {
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  const step = getStepByName(stepName);
  if (!step) {
    throw new Error('Étape introuvable')
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
      // Trouve la prochaine sous-étape disponible
      const nextAfterDirection = getNextSubStep(step, 'direction');
      if (nextAfterDirection) updateData.currentSubStep = nextAfterDirection;
      break
    case 'enigma':
      updateData.enigmaCompletedAt = now
      // Trouve la prochaine sous-étape disponible
      const nextAfterEnigma = getNextSubStep(step, 'enigma');
      if (nextAfterEnigma) updateData.currentSubStep = nextAfterEnigma;
      break
    case 'bonus':
      updateData.bonusAttemptedAt = now
      updateData.isBonusCorrect = data?.isCorrect || false
      // Trouve la prochaine sous-étape disponible
      const nextAfterBonus = getNextSubStep(step, 'bonus');
      if (nextAfterBonus) updateData.currentSubStep = nextAfterBonus;
      break
    case 'key':
      updateData.keyCompletedAt = now
      updateData.collectedKey = data?.key || ''
      // L'étape est maintenant complètement terminée
      break
    case 'final':
      updateData.keyCompletedAt = now
      // Pour l'étape finale (dernière étape), marquer la session comme terminée
      if (isLastStep(stepSession.stepRank)) {
        await completeSession(sessionId);
      }
      break
  }

  return prisma.stepSession.update({
    where: { id: stepSession.id },
    data: updateData
  })
}

// Fonction pour ajouter une tentative d'énigme et une pénalité
export async function addEnigmaAttempt(sessionId: string, stepName: string) {
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  return prisma.stepSession.update({
    where: { id: stepSession.id },
    data: {
      enigmaAttemptsCount: stepSession.enigmaAttemptsCount + 1,
      penaltyTimeMs: stepSession.penaltyTimeMs + WRONG_ANSWER_PENALTY_TIME_MS
    }
  })
}

// Fonction pour ajouter une pénalité d'indice
export async function addHintPenalty(sessionId: string, stepName: string) {
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  return prisma.stepSession.update({
    where: { id: stepSession.id },
    data: {
      hasUsedHint: true,
      penaltyTimeMs: stepSession.penaltyTimeMs + HINT_PENALTY_TIME_MS
    }
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

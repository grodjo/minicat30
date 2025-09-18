import { prisma } from './prisma'
import { getStepByOrder, getStepByName, getTotalSteps, isLastStep, getFinalStep, getAvailableSubSteps, getNextSubStep, TOTAL_BONUS_AVAILABLE, validateStepAnswer, validateFinalStepAnswer } from './steps'

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
  // ✅ NOUVEAU: Compter le nombre d'étapes complétées via completedAt au lieu d'answeredAt
  const completedSteps = await prisma.stepSession.findMany({
    where: { gameSessionId: sessionId, completedAt: { not: null } },
    select: { stepRank: true },
    orderBy: { completedAt: 'asc' }
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
  let isCorrect;

  // Si c'est l'étape finale (dernière étape de la liste)
  if (isLastStep(stepSession.stepRank)) {
    step = getFinalStep();
    if (!step || !step.enigma) throw new Error('Étape finale introuvable ou sans énigme');
    isCorrect = validateFinalStepAnswer('final', answer);
  } else {
    step = getStepByName(stepName);
    if (!step || !step.enigma) throw new Error('Étape introuvable ou sans énigme');
    isCorrect = validateStepAnswer(stepName, 'enigma', answer);
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

export async function completeSession(sessionId: string) {
  return prisma.gameSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() }
  })
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
        where: { completedAt: { not: null } }, // ✅ NOUVEAU: Utiliser completedAt au lieu de keyCompletedAt
        orderBy: { stepRank: 'asc' } 
      }
    }
  })

  const scoreboard = sessions.map((s): ScoreboardRow => {
    // ✅ NOUVEAU: Calcul du temps effectif de la session (durée réelle sans pénalités)
    const sessionEffectiveTime = s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : 0
    
    // ✅ NOUVEAU: Calcul des pénalités totales de la session
    const sessionTotalPenalties = s.stepSessions.reduce((sum: number, ss): number => {
      return sum + ss.penaltyTimeMs
    }, 0)
    
    // ✅ NOUVEAU: Temps final de la session = temps effectif + pénalités
    const sessionTotalTime = sessionEffectiveTime + sessionTotalPenalties
    
    const totalBonusCorrect = s.stepSessions.reduce((sum: number, ss): number => {
      return sum + (ss.isBonusCorrect ? 1 : 0)
    }, 0)
    const totalBonusAvailable = TOTAL_BONUS_AVAILABLE
    
    return {
      pseudo: s.user.pseudo,
      totalTime: sessionTotalTime, // ✅ NOUVEAU: Utiliser le temps total calculé correctement
      totalBonusCorrect,
      totalBonusAvailable,
      completedAt: s.completedAt!,
      steps: s.stepSessions.map((ss): ScoreboardStepRow => {
        // ✅ NOUVEAU: Calcul du temps effectif de l'étape (durée réelle sans pénalités)
        const stepEffectiveTime = ss.completedAt && ss.startedAt ?
          ss.completedAt.getTime() - ss.startedAt.getTime() : 0
        
        // ✅ NOUVEAU: Temps final de l'étape = temps effectif + pénalités de cette étape
        const stepTotalTime = stepEffectiveTime + ss.penaltyTimeMs
        
        return {
          stepName: isLastStep(ss.stepRank) ? 'Étape finale' : ss.stepName,
          timeSpent: stepTotalTime, // ✅ NOUVEAU: Temps total de l'étape (effectif + pénalités)
          penaltyTime: ss.penaltyTimeMs, // ✅ Pénalités pures de cette étape
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

// Calculer le total des pénalités pour une session
export async function getSessionTotalPenalties(sessionId: string): Promise<number> {
  const result = await prisma.stepSession.aggregate({
    where: { gameSessionId: sessionId },
    _sum: { penaltyTimeMs: true }
  })
  
  return result._sum.penaltyTimeMs || 0
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
      currentSubStep: currentStepSession.currentSubStep as 'direction' | 'moving' | 'enigma' | 'bonus' | 'key' | 'final'
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
      isBonusCorrect: false
    }
  })

  return {
    step,
    stepSession,
    currentSubStep: initialSubStep as 'direction' | 'moving' | 'final'
  }
}

export async function completeSubStep(
  sessionId: string, 
  stepName: string, 
  subStepType: 'direction' | 'moving' | 'enigma' | 'bonus' | 'key' | 'final', 
  data?: { isCorrect?: boolean; key?: string; giveUp?: boolean }
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
    completedAt?: Date; // Nouveau champ pour marquer la fin complète de l'étape
  } = {}

  switch (subStepType) {
    case 'direction':
      updateData.directionCompletedAt = now
      // Si l'étape a un "moving", aller vers moving, sinon vers la prochaine sous-étape
      if (step.moving) {
        updateData.currentSubStep = 'moving';
      } else {
        const nextAfterDirection = getNextSubStep(step, 'direction');
        if (nextAfterDirection) updateData.currentSubStep = nextAfterDirection;
      }
      break
    case 'moving':
      // Le moving ne marque pas de completion spécifique, juste passage à la prochaine étape
      const nextAfterMoving = getNextSubStep(step, 'moving');
      if (nextAfterMoving) updateData.currentSubStep = nextAfterMoving;
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
      updateData.completedAt = now // ✅ NOUVEAU: Marquer l'étape comme complètement terminée
      break
    case 'final':
      updateData.keyCompletedAt = now
      updateData.completedAt = now // ✅ NOUVEAU: Marquer l'étape finale comme terminée
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

  // Ajouter la pénalité de temps (1 minute)
  await addTimePenaltyToDatabase(sessionId, stepName, 1);

  return prisma.stepSession.update({
    where: { id: stepSession.id },
    data: {
      enigmaAttemptsCount: stepSession.enigmaAttemptsCount + 1
    }
  })
}

// Fonction pour ajouter une pénalité de clé (5 minutes)
export async function addKeyPenalty(sessionId: string, stepName: string) {
  // Ajouter la pénalité de temps (5 minutes)
  await addTimePenaltyToDatabase(sessionId, stepName, 5);
}

// Fonction générique pour ajouter une pénalité de temps
export async function addTimePenaltyToDatabase(sessionId: string, stepName: string, penaltyMinutes: number) {
  const penaltyMs = penaltyMinutes * 60 * 1000;
  
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  return prisma.stepSession.update({
    where: { id: stepSession.id },
    data: {
      penaltyTimeMs: stepSession.penaltyTimeMs + penaltyMs
    }
  })
}

// Fonction pour ajouter une pénalité d'indice et incrémenter l'index d'indice
export async function addHintPenalty(sessionId: string, stepName: string) {
  const stepSession = await prisma.stepSession.findUnique({
    where: { gameSessionId_stepName: { gameSessionId: sessionId, stepName } }
  })

  if (!stepSession) {
    throw new Error('Session d\'étape introuvable')
  }

  // Ajouter la pénalité de temps (3 minutes)
  await addTimePenaltyToDatabase(sessionId, stepName, 3);

  // Détermine quel champ mettre à jour selon la sous-étape actuelle
  const currentSubStep = stepSession.currentSubStep;
  const updateData: {
    directionHintIndex?: number;
    enigmaHintIndex?: number;
  } = {};

  if (currentSubStep === 'direction') {
    updateData.directionHintIndex = stepSession.directionHintIndex + 1;
  } else if (currentSubStep === 'enigma' || currentSubStep === 'final') {
    updateData.enigmaHintIndex = stepSession.enigmaHintIndex + 1;
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

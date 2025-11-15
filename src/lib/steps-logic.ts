import { steps } from '../game-steps';
import { validateAnswer } from './answer-validation';

export interface Step {
  stepRank: number;
  name: string;
  direction?: {
    instruction: string;
    hints: string[];
    acceptedAnswers: string[];
  };
  moving?: string;
  enigma?: {
    question: string;
    hints: string[];
    acceptedAnswers: string[];
    strictMode?: boolean;
  };
  key?:{
    description: string;
    acceptedAnswers: string[];
  };
  bonus?: {
    question: string;
    acceptedAnswers: string[];
    strictMode?: boolean
  };
}

export type SubStepType = 'direction' | 'moving' | 'enigma' | 'bonus' | 'key' | 'final';

export interface StepProgress {
  stepName: string;
  currentSubStep: SubStepType;
  directionCompleted: boolean;
  enigmaCompleted: boolean;
  bonusAttempted: boolean;
  bonusCorrect: boolean;
  keyCompleted: boolean;
}

export const getStepByName = (name: string): Step | undefined => {
  return steps.find(s => s.name === name);
};

export const getStepByOrder = (order: number): Step | undefined => {
  return steps[order - 1]; // order is 1-based, array is 0-based
};

export const getTotalSteps = (): number => {
  return steps.length;
};

// Compter le nombre d'étapes avec des bonus
export const TOTAL_BONUS_AVAILABLE = steps.filter(step => step.bonus).length;

export const isLastStep = (stepRank: number): boolean => {
  return stepRank === steps.length;
};

export const getFinalStep = (): Step | undefined => {
  return steps[steps.length - 1];
};

export const getNextStep = (currentOrder: number): Step | undefined => {
  return steps[currentOrder]; // currentOrder is the next index (0-based)
};

export const getCurrentStepOrder = (stepName: string): number => {
  const index = steps.findIndex(s => s.name === stepName);
  return index + 1; // return 1-based order
};

// Fonctions pour gérer la progression des sous-étapes
export const getAvailableSubSteps = (step: Step): SubStepType[] => {
  const availableSubSteps: SubStepType[] = [];
  
  if (step.direction) availableSubSteps.push('direction');
  if (step.moving) availableSubSteps.push('moving'); 
  if (step.enigma) availableSubSteps.push('enigma');
  if (step.bonus) availableSubSteps.push('bonus');
  if (step.key) availableSubSteps.push('key');
  
  return availableSubSteps;
};

export const getAvailableSubStepsForFinalStep = (step: Step): SubStepType[] => {
  // Pour l'étape finale, on utilise le type 'final' au lieu de 'enigma'
  if (step.enigma) return ['final'];
  return [];
};

export const getNextSubStep = (step: Step, currentSubStep: SubStepType): SubStepType | null => {
  // Si c'est l'étape finale, elle n'a qu'une seule sous-étape
  if (step.stepRank && isLastStep(step.stepRank)) {
    return null; // Pas de sous-étape suivante pour l'étape finale
  }
  
  const availableSubSteps = getAvailableSubSteps(step);
  const currentIndex = availableSubSteps.indexOf(currentSubStep);
  
  if (currentIndex === -1 || currentIndex >= availableSubSteps.length - 1) {
    return null; // Pas de sous-étape suivante
  }
  
  return availableSubSteps[currentIndex + 1];
};

export const getNextSubStep_old = (currentSubStep: SubStepType): SubStepType | null => {
  const sequence: SubStepType[] = ['direction', 'enigma', 'bonus', 'key'];
  const currentIndex = sequence.indexOf(currentSubStep);
  return currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null;
};

export const getSubStepData = (step: Step, subStepType: SubStepType) => {
  switch (subStepType) {
    case 'direction':
      if (!step.direction) return null;
      return {
        type: 'direction',
        content: step.direction.instruction,
        hints: step.direction.hints,
        requiresAnswer: true
      };
    case 'moving':
      return {
        type: 'moving',
        content: step.moving || 'En route vers la prochaine destination !',
        buttonText: 'On y est !'
      };
    case 'enigma':
      if (!step.enigma) return null;
      return {
        type: 'enigma',
        question: step.enigma.question,
        hints: step.enigma.hints,
        requiresAnswer: true
      };
    case 'bonus':
      if (!step.bonus) return null;
      return {
        type: 'bonus',
        question: step.bonus.question,
        requiresAnswer: true,
        singleAttempt: true
      };
    case 'key':
      if (!step.key) return null;
      return {
        type: 'key',
        content: step.key.description || 'Trouvez le chiffre clé',
        requiresAnswer: true
      };
    case 'final':
      if (!step.enigma) return null;
      return {
        type: 'final',
        question: step.enigma.question,
        hints: step.enigma.hints,
        requiresAnswer: true
      };
    default:
      return null;
  }
};

export const validateStepAnswer = (stepName: string, subStepType: SubStepType, answer: string): boolean => {
  const step = getStepByName(stepName);
  if (!step) return false;

  switch (subStepType) {
    case 'direction':
      if (!step.direction) return false;
      return validateAnswer(answer, step.direction.acceptedAnswers, false);
    case 'moving':
      // Les sous-étapes 'moving' ne nécessitent pas de validation de réponse
      return true;
    case 'enigma':
      if (!step.enigma || !step.enigma.acceptedAnswers) return false;
      return validateAnswer(answer, step.enigma.acceptedAnswers, step.enigma.strictMode || false);
    case 'bonus':
      if (!step.bonus) return false;
      return validateAnswer(answer, step.bonus.acceptedAnswers, step.bonus.strictMode || false);
    case 'key':
      // Maintenant les clés nécessitent une validation de réponse
      if (!step.key || !step.key.acceptedAnswers) return false;
      return validateAnswer(answer, step.key.acceptedAnswers, false); // Les clés n'ont pas d'option strictMode
    case 'final':
      if (!step.enigma || !step.enigma.acceptedAnswers) return false;
      return validateAnswer(answer, step.enigma.acceptedAnswers, step.enigma.strictMode || false);
    default:
      return false;
  }
};

export const validateFinalStepAnswer = (subStepType: SubStepType, answer: string): boolean => {
  const finalStep = getFinalStep(); // Utilise la dernière étape de la liste
  if (!finalStep) return false;

  switch (subStepType) {
    case 'enigma':
    case 'final':
      if (!finalStep.enigma || !finalStep.enigma.acceptedAnswers) return false;
      return validateAnswer(answer, finalStep.enigma.acceptedAnswers, finalStep.enigma.strictMode || false);
    default:
      return false;
  }
};

export const getStepCorrectAnswer = (stepName: string, subStepType: SubStepType): string | null => {
  const step = getStepByName(stepName);
  if (!step) return null;

  switch (subStepType) {
    case 'direction':
      if (!step.direction || !step.direction.acceptedAnswers || step.direction.acceptedAnswers.length === 0) return null;
      return step.direction.acceptedAnswers[0];
    case 'enigma':
      if (!step.enigma || !step.enigma.acceptedAnswers || step.enigma.acceptedAnswers.length === 0) return null;
      return step.enigma.acceptedAnswers[0];
    case 'bonus':
      if (!step.bonus || !step.bonus.acceptedAnswers || step.bonus.acceptedAnswers.length === 0) return null;
      return step.bonus.acceptedAnswers[0];
    case 'key':
      if (!step.key || !step.key.acceptedAnswers || step.key.acceptedAnswers.length === 0) return null;
      return step.key.acceptedAnswers[0];
    case 'final':
      if (!step.enigma || !step.enigma.acceptedAnswers || step.enigma.acceptedAnswers.length === 0) return null;
      return step.enigma.acceptedAnswers[0];
    default:
      return null;
  }
};
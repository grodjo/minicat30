export interface Step {
  stepRank: number;
  name: string;
  direction?: string; // Sous-étape 1: indication pour se rendre au lieu (optionnelle)
  key?: string;       // Sous-étape 4: indication pour trouver l'objet caché (optionnelle)
  enigma?: {          // Sous-étape 2: énigme principale (optionnelle)
    question: string;
    answer: string;
    hint: string;
  };
  bonus?: {           // Sous-étape 3: question bonus (optionnelle)
    question: string;
    answer: string;
  };
}

// Types pour gérer les sous-étapes
export type SubStepType = 'direction' | 'enigma' | 'bonus' | 'key' | 'final';

export interface StepProgress {
  stepName: string;
  currentSubStep: SubStepType;
  directionCompleted: boolean;
  enigmaCompleted: boolean;
  bonusAttempted: boolean;
  bonusCorrect: boolean;
  keyCompleted: boolean;
}

export const steps: Step[] = [
  {
    stepRank: 1,
    name: "01 | Animal domestique",
    direction: "Rendez-vous dans le parc le plus proche de votre position",
    key: "Cherchez sous le banc le plus proche de l'aire de jeux",
    enigma: {
      question: "Quel animal domestique aboie ?",
      answer: "Chien",
      hint: "Il remue la queue quand il est content et est le meilleur ami de l'homme"
    },
    bonus: {
      question: "Combien de pattes a un chien ?",
      answer: "4"
    }
  },
  {
    stepRank: 2,
    name: "02 | Couleur primaire",
    direction: "Dirigez-vous vers la fontaine la plus proche",
    key: "Regardez derrière la plaque commémorative de la fontaine",
    enigma: {
      question: "Quelle couleur obtient-on en mélangeant le jaune et le bleu ?",
      answer: "Vert",
      hint: "C'est la couleur de l'herbe et des feuilles au printemps"
    },
    bonus: {
      question: "Citez une couleur primaire",
      answer: "Rouge"
    }
  },
  {
    stepRank: 3,
    name: "03 | Planète rouge",
    direction: "Trouvez le café ou restaurant le plus proche",
    key: "Vérifiez sous la table en terrasse la plus éloignée de l'entrée",
    enigma: {
      question: "Quelle planète est surnommée la planète rouge ?",
      answer: "Mars",
      hint: "Elle est la quatrième planète du système solaire et porte le nom du dieu romain de la guerre"
    },
    bonus: {
      question: "Combien y a-t-il de planètes dans notre système solaire ?",
      answer: "8"
    }
  },
  {
    stepRank: 4,
    name: "FINAL | Le grand défi",
    enigma: {
      question: "Avec toutes les clés que vous avez trouvées, quelle est la réponse finale ?",
      answer: "VICTOIRE",
      hint: "Réfléchissez à ce que toutes ces clés ont en commun..."
    }
  }
];

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
  if (isLastStep(step.stepRank)) {
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
        content: step.direction,
        buttonText: 'On y est !'
      };
    case 'enigma':
      if (!step.enigma) return null;
      return {
        type: 'enigma',
        question: step.enigma.question,
        hint: step.enigma.hint,
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
        content: step.key,
        buttonText: 'On a la clé !'
      };
    case 'final':
      if (!step.enigma) return null;
      return {
        type: 'final',
        question: step.enigma.question,
        hint: step.enigma.hint,
        requiresAnswer: true
      };
    default:
      return null;
  }
};

export const validateStepAnswer = (stepName: string, subStepType: SubStepType, answer: string): boolean => {
  const step = getStepByName(stepName);
  if (!step) return false;

  const normalizedAnswer = answer.trim().toLowerCase();

  switch (subStepType) {
    case 'enigma':
    case 'final':
      if (!step.enigma) return false;
      return normalizedAnswer === step.enigma.answer.toLowerCase();
    case 'bonus':
      if (!step.bonus) return false;
      return normalizedAnswer === step.bonus.answer.toLowerCase();
    default:
      // Les sous-étapes 'direction' et 'key' ne nécessitent pas de validation de réponse
      return true;
  }
};

export const validateFinalStepAnswer = (subStepType: SubStepType, answer: string): boolean => {
  const finalStep = getFinalStep(); // Utilise la dernière étape de la liste
  if (!finalStep) return false;
  
  const normalizedAnswer = answer.trim().toLowerCase();

  switch (subStepType) {
    case 'final':
      if (!finalStep.enigma) return false;
      return normalizedAnswer === finalStep.enigma.answer.toLowerCase();
    default:
      return false;
  }
};
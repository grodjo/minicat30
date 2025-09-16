export interface Step {
  stepRank: number;
  name: string;
  direction?: {
    instruction: string;
    hints: string[];
    acceptedAnswers: string[];
  };
  moving?: string;  // Nouveau texte pour l'étape de déplacement
  enigma?: {
    question: string;
    answers?: string[];
    correctAnswer?: number;
    acceptedAnswers?: string[];
    hints?: string[];
  };
  key?: string;
  bonus?: {
    question: string;
    acceptedAnswers: string[];
  };
}

// Types pour gérer les sous-étapes
import { validateAnswer } from './answer-validation';

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

export const steps: Step[] = [
  {
    stepRank: 1,
    name: "01",
    direction: {
      instruction: "Rendez-vous à l'intérieur de la 🏃 👩🪿",
      hints: [
        "Son entrée se trouve place de la Bastille",
        "Son numéro correspond au nombre d'apôtres de Jésus",
      ],
      acceptedAnswers: ["Cour Damoye", "Damoye"]
    },
    moving: "Direction la Cour Damoye !",
    enigma: {
      question: "Pas loin de la fontaine se cache une statue, mais qui est-ce ?",
      acceptedAnswers: ["La vierge Marie", "vierge Marie", "Marie"],
      hints: [
        "Levez la tête !",
      ]
    },
    bonus: {
      question: "Farouchement vierge également, qui était la déesse grecque protectrice des femmes et de la chasse ?",
      acceptedAnswers: ["artémis", "artemis"]
    },
    key: "Quelle est l'heure d'ouverture de la cour le jeudi ?"
  },
  {
    stepRank: 2,
    name: "02",
    direction: {
      instruction: "Je partage mon nom avec un pont. À l'ombre de la place des Vosges, mes jardins et ma cour valent le détour",
      hints: [
        "Mon entrée se fait par la rue Saint Antoine",
        "J'héberge le centre des monuments nationaux",
      ],
      acceptedAnswers: ["Hôtel de Sully", "Hôtel Sully"]
    },
    moving: "En route vers l'Hôtel Sully !",
    enigma: {
      question: "Combien de tétons à l'air libre pouvez-vous apercevoir dans la cour ?",
      acceptedAnswers: ["13", "14", "treize", "quatorze"],
      hints: []
    },
    bonus: {
      question: "Oh les belles sphinges ! Dans la mythologie grecque, à qui ont-elles posé l'énigme de l'animal à 4 pattes le matin, 2 le midi et 3 le soir ?",
      acceptedAnswers: ["Oedipe", "oedipe"]
    },
    key: "Étrange ce cadran solaire, il manque un chiffre non ?"
  },
  {
    stepRank: 3,
    name: "03",
    direction: {
      instruction: "Dans un petit village avoisinant, le père de Gargantua a sa cour",
      hints: [
        "L'église d'à côté porte le même nom que le village",
      ],
      acceptedAnswers: ["Saint-Paul", "Village Saint-Paul"]
    },
    moving: "Direction le Village Saint-Paul !",
    enigma: {
      question: "Un bistro pas si bien caché propose une carte convenable. Toutefois Célia se jetterait un seul des plats les yeux fermés. Combien coûte-t-il ?",
      acceptedAnswers: ["18", "18€", "18 euros", "dix-huit", "dix huit"],
      hints: [
        "C'est du sale !",
        "Des féculents, de la viande, des crudités, un laitage, c'est un plat complet",
      ],

    },
    bonus: {
      question: "De quelle ville provient cette délicate spécialité culinaire ?",
      acceptedAnswers: ["Hamburg"]
    },
    key: "Le numéro de rue de la cour Saint-Paul"
  },
  {
    stepRank: 4,
    name: "04",
    direction: {
      instruction: "À quelques pas de là, rendez-vous devant l'établissement scolaire du roi des Francs",
      hints: [
        "Son daron s'appelait Pépin",
      ],
      acceptedAnswers: ["Charlemagne", "Lycée Charlemagne"]
    },
    moving: "Direction le lycée Charlemagne !",
    enigma: {
      question: "Oh la belle fontaine ! En quelle année fut-elle construite ?",
      acceptedAnswers: ["1840", "Mille huit cent quarante", "MDCCCXL"],
      hints: [
        "M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1",
        "Un siècle plus tard commençait le régime de Vichy"
      ]
    },
    bonus: {
      question: "Des serpents, de l'eau, des canalisations, mais que dirait Harry devant cette fontaine ?",
      acceptedAnswers: ["Ouvre", "Ouvre toi"]
    },
    key: "Combien y a-t-il de poteaux oranges dans cette rue ?"
  },
  {
    stepRank: 5,
    name: "05",
    direction: {
      instruction: "Mon 1er peut être particulier ou de passe.\nMon deuxième est bien à sa place.\nÀ ma connaissance, vous possédez tous cinq de mon troisième.\nRendez-vous dans le jardin de mon tout.",
      hints: [
        "Rapprochez-vous de la Seine",
      ],
      acceptedAnswers: ["Hôtel de Sens", "Hôtel Sens"]
    },
    moving: "Direction l'Hôtel de Sens !",
    enigma: {
      question: "En faisant abstraction des arrondis dans les coins, combien de triangles sont dessinés par les chemins ?",
      acceptedAnswers: ["16", "seize"],
      hints: []
    },
    bonus: {
      question: "À propos de jardins, connaissez-vous le prénom du célèbre jardinier de Versailles ?",
      acceptedAnswers: ["André"]
    },
    key: "J'espère que vous êtes au courant qu'il est interdit de nourrir les oiseaux dans les parcs! Votre prochaine clé est le numero de l'article de la réglementation associée."
  },
  {
    stepRank: 6,
    name: "06",
    direction: {
      instruction: "Dirigez-vous vers la petite soeur de la Cité où se trouve une boutique qui aurait pu être celle de Gepetto",
      hints: ["Les glaces les plus connues de Paris ne se trouvent pas loin non plus", "C'est une boutique de marionettes"],
      acceptedAnswers: ["Clair de rêve"]
    },
    moving: "Direction Clair de Rêve !",
    enigma: {
      question: "À priori le peintre ne devrait pas avoir besoin d'une couleur, laquelle ?",
      acceptedAnswers: ["jaune", "orange"],
      hints: ["Il est en train de peindre un couple", "Ils ne sont pas hyper solaires"]
    },
    bonus: {
      question: "En quelle année est sorti le dessin animé Pinocchio de Disney ?",
      acceptedAnswers: ["1940"]
    },
    key: "Le numéro du roi de France ayant donné son nom à cette île"
  },
  {
    stepRank: 7,
    name: "07",
    direction: {
      instruction: "AB°CD’CE.C. E°EF’C.C\n\nA=E^2\nC=B-A+F\nD=C-A-F\nF=B^0*A^0\nE=∛B",
      hints: ["Chaque lettre représente un chiffre différent donc E ne peut valoir que 2", "Google Maps accepte les coordonnées"],
      acceptedAnswers: ["Place Maurice Audin"]
    },
    moving: "Direction la place Maurice Audin !",
    enigma: {
      question: "Comment s'appelle la femme de ce bon vieux Maurice ?",
      acceptedAnswers: ["Josette"],
      hints: ["Il y a bien un panneau sur cette place !"]
    },
    bonus: {
      question: "Dans une pub pour quelle marque, Maurice le poisson rouge poussait-il le bouchon un peu trop loin ?",
      acceptedAnswers: ["Nestlé"]
    },
    key: "Oups je ne sais pas encore"
  },
  {
    stepRank: 8,
    name: "FINAL",
    enigma: {
      question: "Avec l'aide de toutes vos clés, déterminez le mot de la fin !",
      acceptedAnswers: ["Prout"],
      hints: []
    },
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
        content: step.key,
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
      return validateAnswer(answer, step.direction.acceptedAnswers);
    case 'moving':
      // Les sous-étapes 'moving' ne nécessitent pas de validation de réponse
      return true;
    case 'enigma':
      if (!step.enigma || !step.enigma.acceptedAnswers) return false;
      return validateAnswer(answer, step.enigma.acceptedAnswers);
    case 'bonus':
      if (!step.bonus) return false;
      return validateAnswer(answer, step.bonus.acceptedAnswers);
    case 'key':
      // Les sous-étapes 'key' ne nécessitent pas de validation de réponse
      return true;
    case 'final':
      if (!step.enigma || !step.enigma.acceptedAnswers) return false;
      return validateAnswer(answer, step.enigma.acceptedAnswers);
    default:
      return false;
  }
};

export const validateFinalStepAnswer = (subStepType: SubStepType, answer: string): boolean => {
  const finalStep = getFinalStep(); // Utilise la dernière étape de la liste
  if (!finalStep) return false;

  switch (subStepType) {
    case 'enigma':
      if (!finalStep.enigma || !finalStep.enigma.acceptedAnswers) return false;
      return validateAnswer(answer, finalStep.enigma.acceptedAnswers);
    default:
      return false;
  }
};
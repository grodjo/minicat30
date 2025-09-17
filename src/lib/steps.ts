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
    answers?: string[];
    hints?: string[];
    acceptedAnswers?: string[];
  };
  key?:{
    description?: string;
    acceptedAnswers?: string[];
  };
  bonus?: {
    question: string;
    acceptedAnswers: string[];
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

export const steps: Step[] = [
  {
    stepRank: 1,
    name: "01",
    direction: {
      instruction: "Premier rendez-vous à l'intérieur de la \"🏃 👩🪿\"",
      hints: [
        "Son entrée se trouve place de la Bastille",
        "Son numéro correspond au nombre d'apôtres à table. Enfin avant que ça ait mal tourné...",
      ],
      acceptedAnswers: ["La Cour Damoye", "Cour Damoye", "Damoye"]
    },
    moving: "Go à la Cour Damoye !\n\nGalopez pendant que vous êtes encore en forme 🐎",
    enigma: {
      question: "Pas loin de la fontaine se cache une statue, mais qui est donc cette gourgandine ?",
      acceptedAnswers: ["La vierge Marie", "vierge Marie", "Marie"],
      hints: [
        "Levez la tête !",
        "Connue pour avoir conçu de manière immaculée"
      ]
    },
    bonus: {
      question: "À l'instar de Marie, plus je suis vierge, plus je suis bonne ! Je peux même être extra-bonne !\n\nQui suis-je ?",
      acceptedAnswers: ["L'huile d'olive", "huile d'olive", "huile"]
    },
    key: {
      description: "Le chiffre clé correspond à l'heure d'ouverture de la cour le jeudi",
      acceptedAnswers: ["9"]
    }
  },
  {
    stepRank: 2,
    name: "02",
    direction: {
      instruction: "La place des Vosges n'a pas le monopole du style dans le coin ! Mon jardin et ma cour valent le détour.",
      hints: [
        "Je partage mon nom avec un pont",
        "Avec Morland, mon nom est celui d'une station de métro",
      ],
      acceptedAnswers: ["Hôtel de Sully", "Hôtel Sully"]
    },
    moving: "Go go go à l'Hôtel de Sully !\n\nL'entrée de la cour se fait par la rue Saint Antoine 😇",
    enigma: {
      question: "Combien de tétons à l'air pouvez-vous apercevoir dans la cour ?",
      acceptedAnswers: ["13", "14", "treize", "quatorze"],
      hints: []
    },
    bonus: {
      question: "Oh les belles sphinges! Dans la mythologie grecque, à qui ont-elles posé l'énigme de l'animal à 4 pattes le matin, 2 le midi et 3 le soir ?",
      acceptedAnswers: ["Oedipe"]
    },
    key: {
      description: "Pratique ce jardin où on peut connaître l'heure sans montre !\n\nLe chiffre clé est justement celui qui manque.",
      acceptedAnswers: ["7"]
    }
  },
  {
    stepRank: 3,
    name: "03",
    direction: {
      instruction: "À quelques pas d'ici, troquez les citadins stressés contre des villageois paisibles !",
      hints: [
        "Le père de Gargantua y a une cour à son nom",
        "L'église et le métro d'à côté porte le même nom",
      ],
      acceptedAnswers: ["Village Saint-Paul", "Saint-Paul"]
    },
    moving: "Engouffrez-vous dans le village Saint-Paul !\n\nMais vous ferez les galeries et les boutiques un autre jour 😬",
    enigma: {
      question: "Au bistrot, Célia se jetterait sur un seul des plats les yeux fermés. Lequel ?",
      acceptedAnswers: ["Burger maison bleu d'Auvergne, oignons confits, steak, frites"],
      hints: [
        "Oui oui il faut tout écrire jusqu'à la dernière lettre ! 😛",
        "C'est du sale ! 😱",
        "En vrai ça a le mérite d'être complet : des féculents, de la viande, des crudités, un laitage, tout y est 👌",
      ],

    },
    bonus: {
      question: "De quelle ville provient cette délicate spécialité culinaire ?",
      acceptedAnswers: ["Hambourg", "Hamburg"]
    },
    key: {
      description: "Le chiffre clé est le numéro de la cour Saint-Paul",
      acceptedAnswers: ["5"]
    }
  },
  {
    stepRank: 4,
    name: "04",
    direction: {
      instruction: "Rendez-vous à l'entrée du bahut d'à côté où Célia fumait des grosses clopes pendant la prépa !",
      hints: [
        "L'école du fils à Pépin le Bref quoi",
        "L'établissement porte le même nom que la rue",
      ],
      acceptedAnswers: ["Le lycée Charlemagne", "Charlemagne", "collège et lycée Charlemagne"]
    },
    moving: "Direction l'entrée du lycée Charlemagne !\n\nPour info, les autres équipes se débrouillent super bien 🥵",
    enigma: {
      question: "Pas toute jeune cette fontaine ! En quelle année fut-elle construite ?",
      acceptedAnswers: ["1840", "Mille huit cent quarante"],
      hints: [
        "M : 1000, D : 500, C : 100, L : 50, X : 10, V : 5, I : 1",
      ]
    },
    bonus: {
      question: "Des serpents, de l'eau, des canalisations, mais que dirait Harry devant cette fontaine ?",
      acceptedAnswers: ["Ouvre toi", "Ouvre", "Open"]
    },
    key: {
      description: "Le chiffre clé est aussi le nombre de poteaux oranges dans cette rue ?",
      acceptedAnswers: ["2"] // ????
    }
  },
  {
    stepRank: 5,
    name: "05",
    direction: {
      instruction: "Mon 1er peut-être particulier ou de passe.\nMon 2ème est bien à sa place.\nVous possédez tous ici 5 de mon 3ème.\nOn se retrouve dans le jardin de mon tout.",
      hints: [
        "Rapprochez-vous de la Seine",
        "Son jardin est à la française, géométrique à souhait"
      ],
      acceptedAnswers: ["L'Hôtel de Sens", "Hotel des sens", "Jardin de l'hôtel de sens", "Jardin de l'hôtel des sens"],
    },
    moving: "Ça décale aux jardins de l'Hôtel de Sens !\n\nAllez vous avez presque fait la moitié 🔥",
    enigma: {
      question: "En faisant abstraction des coins, combien de triangles sont dessinés par les allées du jardin ?",
      acceptedAnswers: ["16", "seize"],
      hints: ["J'aurais pu faire un schema mais j'ai eu un peu la flemme", "La réponse c'est 16"]
    },
    bonus: {
      question: "À propos de jardins, vous connaissez sûrement le célèbre jardinier de Versailles. Mais quel était son prénom ?",
      acceptedAnswers: ["André"]
    },
    key: {
      description: "Interdit de nourrir les oiseaux dans les parcs enfin !\nVous connaissez bien sûr l'article de la réglementation qui porte le numéro du chiffre clé !.",
      acceptedAnswers: ["3"]
    }
  },
  {
    stepRank: 6,
    name: "06",
    direction: {
      instruction: "Dirigez-vous vers la petite soeur de la Cité où se trouve une boutique qui aurait pu être celle de Gepetto",
      hints: ["Les glaces les plus connues de Paris ne se trouvent pas loin non plus", "C'est une boutique de marionettes"],
      acceptedAnswers: ["Clair de rêve"]
    },
    moving: "Allez zou, à la boutique Clair de Rêve !\n\nDur de résister à un petit crochet par Berthillon 🍨",
    enigma: {
      question: "À priori le peintre ne devrait pas avoir besoin d'une couleur, laquelle ?",
      acceptedAnswers: ["jaune", "orange"],
      hints: ["Il est en train de peindre un couple", "Ils ne sont pas hyper solaires"]
    },
    bonus: {
      question: "À dix ans près, en quelle année est sorti le dessin animé Pinocchio de Disney ?",
      acceptedAnswers: ["1940", "1930", "1931", "1932", "1933", "1934", "1935", "1936", "1937", "1938", "1939", "1941", "1942", "1943", "1944", "1945", "1946", "1947", "1948", "1949", "1950"]
    },
    key: {
      description: "Le Louis qui a donné son nom à cette île avait comme numéro le chiffre clé",
      acceptedAnswers: ["9"]
    }
  },
  {
    stepRank: 7,
    name: "07",
    direction: {
      instruction: "AB°CD’CE.C. E°EF’C.C\n\nA=E^2\nC=B-A+F\nD=C-A-F\nF=B^0*A^0\nE=∛B",
      hints: ["Chaque lettre représente un chiffre différent donc E ne peut valoir que 2", "Google Maps accepte les coordonnées 😉"],
      acceptedAnswers: ["Place Maurice Audin", "Maurice Audin"]
    },
    moving: "Tracez vers la place Maurice Audin !\n\nC'est le moment d'appuyer sur le champignon 🍄",
    enigma: {
      question: "Quel est le prénom de la femme de ce bon vieux Maurice ?",
      acceptedAnswers: ["Josette"],
      hints: ["Il y a bien un panneau sur cette place !"]
    },
    bonus: {
      question: "Dans quelle ville ont été signés les accords qui ont mis fin à la guerre d'Algérie ?",
      acceptedAnswers: ["Evian"]
    },
    key: {
      description: "Le chiffre clé correspond à l'écart d'âge entre Maurice et sa femme à la mort de ce dernier",
      acceptedAnswers: ["1"]
    }
  },
  {
    stepRank: 8,
    name: "08",
    direction: {
      instruction: "Apparemment c'était distrayan de voir des types ",
      hints: ["Paris ne s'appelait pas encore Paris", "Il faut le dire, celles de Nîmes sont quand même plus connues"],
      acceptedAnswers: ["Les arènes de Lutèce", "Arène de Lutèce"]
    },
    moving: "On file aux arènes de Lutèce !\n\nVotre avance s'amenuise, mais tenez bon 💪",
    enigma: {
      question: "Qui a sculpté l'unique statue visible dans les arènes ?",
      acceptedAnswers: ["Gabriel de Mortillet"],
      hints: ["Il faut le prénom et le nom"]
    },
    bonus: {
      question: "Qui est l'auteur de la série \"Astérix et Obélix : Le combat des chefs\" sortie en 2025 sur Netflix ?",
      acceptedAnswers: ["Alain Chabat", "Chabat"]
    },
    key: {
      description: "Le chiffre clé correspond au siècle durant lequel les arènes furent détruites par les barbares",
      acceptedAnswers: ["3"]
    }
  },
  {
    stepRank: 9,
    name: "09",
    direction: {
      instruction: "Dernier arrêt devant le monument culminant sur la \"montagne\" qui vous surplombe",
      hints: ["Je ne dirais pas non pour que mon nom figure sur la façade"],
      acceptedAnswers: ["Le Panthéon"]
    },
    moving: "Bon courage pour l'ascension jusqu'au Panthéon !\n\nProfitez du dénivelé pour faire la différence 🥾",
    enigma: {
      question: "Wow, toujours aussi impressionnant ce fronton !\n\nEn quelle année est né Pierre Corneille ?",
      acceptedAnswers: ["1606"],
      hints: ["La réponse n'est pas sur le fronton"]
    },
    bonus: {
      question: "Citez au choix la première ou la dernière femme en date à être entrée au Panthéon ?",
      acceptedAnswers: ["Marie Curie ou Joséphine Baker", "Marie Curie", "Curie", "Joséphine Baker", "Baker"]
    },
    key: {
      description: "Il faut ajouter le chiffre clé à l'animal (vraiment) présent sur le fronton pour obtenir un os du corps humain",
      acceptedAnswers: ["6"]
    }
  },
  {
    stepRank: 10,
    name: "FINAL",
    enigma: {
      question: "Avec l'aide de toutes vos clés, déterminez le mot de la fin !",
      acceptedAnswers: ["GRANDIOSE"],
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
      // Maintenant les clés nécessitent une validation de réponse
      if (!step.key || !step.key.acceptedAnswers) return false;
      return validateAnswer(answer, step.key.acceptedAnswers);
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
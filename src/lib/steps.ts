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

export const steps: Step[] = [
  {
    stepRank: 1,
    name: "01",
    direction: {
      instruction: "Premier rendez-vous à l'intérieur de la \"🏃 👩🪿\"",
      hints: [
        "Son entrée se trouve place de la Bastille",
        "Son numéro correspond au nombre d'apôtres de Jésus",
      ],
      acceptedAnswers: ["La Cour Damoye", "Cour Damoye", "Damoye"]
    },
    moving: "Go à la Cour Damoye !\n\n🐎\nGalopez pendant que vous êtes encore en forme",
    enigma: {
      question: "Pas loin de la fontaine se cache une statue, qui est-ce?",
      acceptedAnswers: ["La vierge Marie", "vierge Marie", "Marie", "vierge"],
      hints: [
        "Levez la tête !",
        "Connue pour avoir conçu de manière immaculée"
      ]
    },
    bonus: {
      question: "Je viens du sud et moi aussi je peux être vierge, extra vierge même...\n\nQui suis-je ?",
      acceptedAnswers: ["L'huile d'olive", "huile d'olive", "huile"]
    },
    key: {
      description: "La cour ouvre le jeudi à l'heure du chiffre clé",
      acceptedAnswers: ["9"]
    }
  },
  {
    stepRank: 2,
    name: "02",
    direction: {
      instruction: "Dans l'ombre de la place des Vosges, mon jardin et ma cour valent pourtant le détour. Venez les admirer !",
      hints: [
        "Je partage mon nom avec un pont",
        "Associé à Morland, mon nom devient celui d'une station de métro",
      ],
      acceptedAnswers: ["Hôtel de Sully", "Hôtel Sully"]
    },
    moving: "Direction l'Hôtel de Sully !\n\n😇\nL'entrée se fait par la rue Saint-Antoine",
    enigma: {
      question: "Combien de tétons à l'air pouvez-vous apercevoir dans la cour ?",
      acceptedAnswers: ["13", "14", "treize", "quatorze"],
      strictMode: true,
      hints: []
    },
    bonus: {
      question: "Oh les belles sphinges !\nDans la mythologie grecque, à qui ont-elles posé l'énigme de l'animal à 4 pattes le matin, 2 le midi et 3 le soir ?",
      acceptedAnswers: ["Oedipe"],
      strictMode: true
    },
    key: {
      description: "Le chiffre clé est manquant sur le cadran solaire",
      acceptedAnswers: ["7"]
    }
  },
  {
    stepRank: 3,
    name: "03",
    direction: {
      instruction: "Rendez-vous ensuite dans le petit village d'à côté !",
      hints: [
        "L'église d'à côté porte le même nom",
        "Le métro d'à côté porte le même nom"
      ],
      acceptedAnswers: ["Village Saint-Paul", "Saint-Paul"]
    },
    moving: "En avant vers le village Saint-Paul !\n\n😬\nVous ferez les galeries et les boutiques un autre jour",
    enigma: {
      question: "Un bistrot se cache dans la cour du père de Gargantua.\nAvec une telle carte, sur quel plat Célia se serait-elle forcément précipitée ?",
      acceptedAnswers: ["Burger", "Hamburger"],
      hints: [
        "C'est un plat ma foi très complet comprenant des féculents, de la viande, des crudités et un laitage",
        "Elle n'aurait pas lu la carte bien longtemps..."
      ],

    },
    bonus: {
      question: "De quelle ville cette délicate spécialité culinaire tire-t-elle son nom ?",
      acceptedAnswers: ["Hambourg", "Hamburg"],
      strictMode: true
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
      instruction: "À 5 minutes à pied, retour en classes préparatoires, sous la supervision du roi des francs !",
      hints: [
        "Roi des francs mais aussi fils de Pépin le Bref",
      ],
      acceptedAnswers: ["Charlemagne", "Le lycée Charlemagne", "collège et lycée Charlemagne", "prépa Charlemagne", "collège charlemagne"]
    },
    moving: "Direction l'entrée du lycée Charlemagne !\n\n🥵\nPour info, les autres équipes se débrouillent super bien",
    enigma: {
      question: "Pas toute jeune cette fontaine ! En quelle année fut-elle construite ?",
      acceptedAnswers: ["1840", "Mille huit cent quarante"],
      strictMode: true,
      hints: [
        "M : 1000, D : 500, C : 100, L : 50, X : 10, V : 5, I : 1",
      ]
    },
    bonus: {
      question: "Des serpents sculptés dans la pierre, de l'eau, des canalisations ? Mais que dirait Harry dans cette situation ?",
      acceptedAnswers: ["Ouvre toi", "Ouvre", "Open"]
    },
    key: {
      description: "Le chiffre clé correspond au nombre de poteaux oranges dans cette rue.",
      acceptedAnswers: ["2"]
    }
  },
  {
    stepRank: 5,
    name: "05",
    direction: {
      instruction: "Mon 1er peut-être particulier ou de ville.\nMon 2ème est bien à sa place.\nVous possédez tous ici 5 de mon 3ème.\nOn se retrouve dans le jardin de mon tout.",
      hints: [
        "Rapprochez vous de la Seine",
      ],
      acceptedAnswers: ["L'Hôtel de Sens", "Hotel des sens", "Jardin de l'hôtel de sens", "Jardin de l'hôtel des sens"],
    },
    moving: "Ça décale au jardin de l'Hôtel de Sens !\n\n🔥\nAllez, vous avez presque fait la moitié",
    enigma: {
      question: "En faisant abstraction des arbres dans les coins, combien de triangles sont dessinés par les allées du jardin ?",
      acceptedAnswers: ["16", "seize"],
      strictMode: true,
      hints: ["J'aurais pu faire un schema mais j'ai eu la flemme, débrouillez-vous !"]
    },
    bonus: {
      question: "À propos de jardins, vous connaissez sûrement le célèbre jardinier de Versailles. Mais quel était son prénom ?",
      acceptedAnswers: ["André"],
      strictMode: true
    },
    key: {
      description: "Interdit de nourrir les oiseaux dans les parcs enfin !\nVous n'ignorez évidemment pas l'article de la réglementation qui porte le numéro du chiffre clé",
      acceptedAnswers: ["3"]
    }
  },
  {
    stepRank: 6,
    name: "06",
    direction: {
      instruction: "Dirigez vous vers une petite boutique qui aurait pu être celle de Gepetto sur la petite soeur de la Cité",
      hints: ["Les glaces les plus connues de Paris ne se trouvent pas loin non plus", "C'est une boutique de marionettes"],
      acceptedAnswers: ["Clair de rêve"]
    },
    moving: "En route vers Clair de Rêve !\n\n🍨\nDur dur de résister à un petit crochet par Berthillon",
    enigma: {
      question: "À priori le peintre ne devrait pas avoir besoin d'une couleur, laquelle ?",
      acceptedAnswers: ["jaune", "orange"],
      strictMode: true,
      hints: ["Il peint un couple", "Ils ne sont pas vraiment solaires"]
    },
    bonus: {
      question: "À dix ans près, en quelle année est sorti le dessin animé Pinocchio de Disney ?",
      acceptedAnswers: ["1940", "1930", "1931", "1932", "1933", "1934", "1935", "1936", "1937", "1938", "1939", "1941", "1942", "1943", "1944", "1945", "1946", "1947", "1948", "1949", "1950"],
      strictMode: true
    },
    key: {
      description: "Le roi qui a donné son nom à l'île dont vous foulez le sol avait le chiffre clé comme numéro de règne",
      acceptedAnswers: ["9"]
    }
  },
  {
    stepRank: 7,
    name: "07",
    direction: {
      instruction: "AB°CD’CE.C E°EF’C.C\n\nA = E^2\nB = E^3\nD = C - 2E - 1\nF = E^0*C^0\n4C - 3E = 14\n2E + C = 9\n",
      hints: ["E=2", "Google Maps accepte les coordonnées 😉"],
      acceptedAnswers: ["Audin"]
    },
    moving: "Tracez vers la place Maurice Audin !\n\n🍄\nC'est le moment d'appuyer sur le champignon",
    enigma: {
      question: "Comment se prénomme de la femme de ce cher Maurice ?",
      acceptedAnswers: ["Josette"],
      strictMode: true,
      hints: ["Il doit bien y avoir un panneau sur cette place !"]
    },
    bonus: {
      question: "Dans quelle ville ont été signés les accords qui ont mis fin à la guerre d'Algérie ?",
      acceptedAnswers: ["Evian"],
      strictMode: true
    },
    key: {
      description: "Le chiffre clé correspond à l'écart d'âge entre Josette et Maurice à la mort de ce dernier",
      acceptedAnswers: ["1"]
    }
  },
  {
    stepRank: 8,
    name: "08",
    direction: {
      instruction: "Pénétrez ensuite dans l'ancienne antre des gladiateurs !",
      hints: ["Paris ne s'appelait pas Paris durant l'Antiquité", "Il faut le dire, celles de Nîmes sont quand même plus connues"],
      acceptedAnswers: ["Les arènes de Lutèce", "Arène de Lutèce"]
    },
    moving: "Filez aux arènes de Lutèce !\n\n💪\nVotre avance s'amenuise, mais tenez bon",
    enigma: {
      question: "Qui a sculpté l'unique statue visible dans les arènes ?",
      acceptedAnswers: ["Mortillet"],
      hints: ["Il faut le prénom et le nom"]
    },
    bonus: {
      question: "En ces temps barbares, quel emoji aurait ordonné à lui seul la mise à mort d'un gladiateur ?",
      acceptedAnswers: ["👎"],
      strictMode: true
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
      instruction: "Dernier arrêt au point culminant de la montagne la plus proche",
      hints: ["\"Aux grands hommes la patrie reconnaissante\""],
      acceptedAnswers: ["Le Panthéon", "La place du Panthéon"]
    },
    moving: "Bon courage pour l'ascension jusqu'au Panthéon !\n\n🥾\nAccélérez dans le dénivelé pour faire la différence",
    enigma: {
      question: "Un animal est présent sur le fronton, lequel ?",
      acceptedAnswers: ["Coq"],
      strictMode: true,
      hints: ["Un véritable symbole national", "Il est au milieu du fronton"]
    },
    bonus: {
      question: "Les femmes sont rares parmi les \"grands hommes\"... Quelle femme fut inhummée au Panthéon en 2018 ?",
      acceptedAnswers: ["Simone Veil", "Veil"],
      strictMode: true
    },
    key: {
      description: "Ajoutez le chiffre clé à la réponse de l'énigme pour obtenir un os du corps humain.",
      acceptedAnswers: ["6"]
    }
  },
  {
    stepRank: 10,
    name: "FINAL",
    enigma: {
      question: "Avec l'aide de toutes vos clés, déterminez le mot de la fin !\n\n🤩\nIndice gratuit : \"comme votre performance aujourd'hui\"",
      acceptedAnswers: ["grandiose"],
      strictMode: true,
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
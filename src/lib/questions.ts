export interface Question {
  stepName: string; // previously id
  order: number;
  title: string;
  answer: string; // server-side only usage
  hints: string[];
}

export const questions: Question[] = [
  {
    stepName: '01 | Animal domestique',
    order: 1,
    title: 'Quel animal domestique aboie ?',
    answer: 'Chien',
    hints: [
      'Il remue la queue quand il est content',
      'Il est le meilleur ami de l\'homme',
      'Il garde la maison'
    ]
  },
  {
    stepName: '02 | Couleur primaire',
    order: 2,
    title: 'Quelle couleur obtient-on en mélangeant le jaune et le bleu ?',
    answer: 'Vert',
    hints: [
      'C\'est la couleur de l\'herbe',
      'C\'est la couleur des feuilles au printemps',
      'C\'est une couleur secondaire'
    ]
  },
  {
    stepName: '03 | Planète rouge',
    order: 3,
    title: 'Quelle planète est surnommée la planète rouge ?',
    answer: 'Mars',
    hints: [
      'Elle est la quatrième planète du système solaire',
      'Elle porte le nom du dieu romain de la guerre',
      'Elle a deux petites lunes'
    ]
  }
];

export function getQuestionByStepName(stepName: string): Question | undefined {
  return questions.find(q => q.stepName === stepName);
}

export function getQuestionByOrder(order: number): Question | undefined {
  return questions.find(q => q.order === order);
}

export function getTotalSteps(): number {
  return questions.length;
}

export function getNextStep(currentOrder: number): Question | undefined {
  return questions.find(q => q.order === currentOrder + 1);
}

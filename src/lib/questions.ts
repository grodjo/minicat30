export interface Question {
  id: string;
  order: number;
  title: string;
  answer: string;
  hints: string[];
}

export const questions: Question[] = [
  {
    id: 'q1',
    order: 1,
    title: 'Quel est le nom de la première grande bibliothèque publique de France ?',
    answer: 'Bibliothèque Mazarine',
    hints: [
      'Elle a été fondée au 17ème siècle',
      'Son nom vient d\'un cardinal célèbre',
      'Elle se trouve dans le 6ème arrondissement de Paris'
    ]
  },
  {
    id: 'q2',
    order: 2,
    title: 'Dans quelle ville se trouve le plus ancien phare encore en activité en France ?',
    answer: 'La Coruña',
    hints: [
      'Ce phare date de l\'époque romaine',
      'Il se trouve en Espagne, pas en France',
      'Son nom commence par "Tour d\'..."'
    ]
  },
  {
    id: 'q3',
    order: 3,
    title: 'Quel est le plus petit département français en superficie ?',
    answer: 'Territoire de Belfort',
    hints: [
      'Il se trouve dans l\'Est de la France',
      'Il a été créé en 1922',
      'Son chef-lieu a le même nom que le département'
    ]
  },
  {
    id: 'q4',
    order: 4,
    title: 'Quelle est la capitale de l\'Australie ?',
    answer: 'Canberra',
    hints: [
      'Ce n\'est ni Sydney ni Melbourne',
      'Elle a été créée spécialement pour être la capitale',
      'Son nom commence par un C'
    ]
  },
  {
    id: 'q5',
    order: 5,
    title: 'Quel élément chimique a pour symbole Au ?',
    answer: 'Or',
    hints: [
      'C\'est un métal précieux',
      'Son symbole vient du latin "Aurum"',
      'Il est de couleur jaune'
    ]
  }
];

export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id);
}

export function getQuestionByOrder(order: number): Question | undefined {
  return questions.find(q => q.order === order);
}

export function getNextQuestion(currentOrder: number): Question | undefined {
  return questions.find(q => q.order === currentOrder + 1);
}

export function getTotalQuestions(): number {
  return questions.length;
}

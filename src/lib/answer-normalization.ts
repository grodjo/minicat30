// Fonction pour supprimer les accents français et gérer les caractères spéciaux
const removeFrenchAccents = (text: string): string => {
	return (
		text
			/** replace œ by oe */
			.replace(/œ/g, 'oe')
			/** replace æ by ae */
			.replace(/æ/g, 'ae')
			/** replace & by et */
			.replace(/&/g, 'et')
			/** replace remaining spaces and commas at the beginning */
			.replace(/^[\s,]+/, '')
			/** replace remaining spaces and commas at the end */
			.replace(/[\s,]+$/, '')
			/** remove french accents: decompose unicode combinations (letter followed by accent) and then remove accent */
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
	);
};

const removeBlanksIfNumber = (text: string): string => {
	// Pattern pour détecter si c'est uniquement des chiffres séparés par des espaces (ex: "10 5", "1 2 3")
	const onlyNumbersPattern = /^[\d\s]+$/;
	
	// Pattern pour détecter des séquences de chiffres séparées par des espaces (ex: "abc 10 5 def")
	const numberSequencePattern = /\b\d+(\s+\d+)+\b/g;
	
	if (onlyNumbersPattern.test(text)) {
		// Si toute la phrase n'est que des chiffres et espaces, on supprime tous les espaces
		return text.replace(/\s+/g, '');
	} else {
		// Sinon, on supprime uniquement les espaces dans les séquences de nombres
		return text.replace(numberSequencePattern, (match) => match.replace(/\s+/g, ''));
	}
};

const convertWordsIntoNumber = (text: string): string => {
	const textSplit = text.split(' ');
	const numberizedTextSplit = textSplit.map((word: string): string => {
		const numberAsWord = numbersAsWords.find(
			(nw: { word: string; number: string }): boolean => nw.word === word
		);
		return numberAsWord?.number || word;
	});
	return numberizedTextSplit.join(' ');
};

const removeSpecifier = (text: string): string => {
	for (const specifier of specifiers) {
		if (text.slice(0, specifier.length) === specifier) {
			return text.replace(specifier, '');
		}
	}
	return text;
};

const replaceDashesAndDotsByBlanks = (text: string): string => {
	return text.replace(/\-/g, ' ').replace(/\./g, ' ');
};

export const normalizeAnswer = (answer: string): string => {
	/** The functions call order is important! */
	let normalizedAnswer = answer.trim().toLowerCase();
	normalizedAnswer = removeFrenchAccents(normalizedAnswer);
	normalizedAnswer = removeSpecifier(normalizedAnswer);
	normalizedAnswer = convertWordsIntoNumber(normalizedAnswer);
	normalizedAnswer = removeBlanksIfNumber(normalizedAnswer);
	normalizedAnswer = replaceDashesAndDotsByBlanks(normalizedAnswer);
	
	// Nettoyer les espaces multiples
	normalizedAnswer = normalizedAnswer.replace(/\s+/g, ' ').trim();

	return normalizedAnswer;
};

const specifiers = [
	"l'",
	'le ',
	'la ',
	'les ',
	'un ',
	'une ',
	"d'",
	'du ',
	'de la ',
	'des ',
	'en ',
	'au ',
	'aux ',
	'the ',
];

const numbersAsWords = [
	{ word: 'zéro', number: '0' },
	{ word: 'aucun', number: '0' },
	{ word: 'aucune', number: '0' },
	// 'un' et 'une' sont traités comme spécificateurs, pas comme nombres
	{ word: 'deux', number: '2' },
	{ word: 'trois', number: '3' },
	{ word: 'quatre', number: '4' },
	{ word: 'cinq', number: '5' },
	{ word: 'six', number: '6' },
	{ word: 'sept', number: '7' },
	{ word: 'huit', number: '8' },
	{ word: 'neuf', number: '9' },
	{ word: 'dix', number: '10' },
	{ word: 'onze', number: '11' },
	{ word: 'douze', number: '12' },
	{ word: 'treize', number: '13' },
	{ word: 'quatorze', number: '14' },
	{ word: 'quinze', number: '15' },
	{ word: 'seize', number: '16' },
	{ word: 'dix-sept', number: '17' },
	{ word: 'dix-huit', number: '18' },
	{ word: 'dix-neuf', number: '19' },
	{ word: 'vingt', number: '20' },
	{ word: 'trente', number: '30' },
	{ word: 'quarante', number: '40' },
	{ word: 'cinquante', number: '50' },
	{ word: 'soixante', number: '60' },
	{ word: 'soixante-dix', number: '70' },
	{ word: 'quatre-vingt', number: '80' },
	{ word: 'quatre-vingt-dix', number: '90' },
	{ word: 'cent', number: '100' },
	{ word: 'mille', number: '1000' },
];

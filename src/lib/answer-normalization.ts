const removeBlanksIfNumber = (text: string): string => {
	const textWithoutBlanks = text.replace(/\s/g, '');
	if (!isNaN(parseFloat(textWithoutBlanks))) {
		if (parseFloat(textWithoutBlanks).toString() === textWithoutBlanks) {
			return textWithoutBlanks;
		}
	}
	return text;
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
	let normalizedAnswer = answer.trim().toUpperCase();
	normalizedAnswer = removeBlanksIfNumber(normalizedAnswer);
	normalizedAnswer = removeSpecifier(normalizedAnswer);
	normalizedAnswer = convertWordsIntoNumber(normalizedAnswer);
	normalizedAnswer = replaceDashesAndDotsByBlanks(normalizedAnswer);
	
	// Nettoyer les espaces multiples
	normalizedAnswer = normalizedAnswer.replace(/\s+/g, ' ').trim();

	return normalizedAnswer;
};

const specifiers = [
	"L'",
	'LE ',
	'LA ',
	'LES ',
	'UN ',
	'UNE ',
	"D'",
	'DU ',
	'DE LA ',
	'DES ',
	'EN ',
	'AU ',
	'AUX ',
	'THE ',
];

const numbersAsWords = [
	{ word: 'ZÉRO', number: '0' },
	{ word: 'AUCUN', number: '0' },
	{ word: 'AUCUNE', number: '0' },
	{ word: 'UN', number: '1' },
	{ word: 'UNE', number: '1' },
	{ word: 'DEUX', number: '2' },
	{ word: 'TROIS', number: '3' },
	{ word: 'QUATRE', number: '4' },
	{ word: 'CINQ', number: '5' },
	{ word: 'SIX', number: '6' },
	{ word: 'SEPT', number: '7' },
	{ word: 'HUIT', number: '8' },
	{ word: 'NEUF', number: '9' },
	{ word: 'DIX', number: '10' },
	{ word: 'ONZE', number: '11' },
	{ word: 'DOUZE', number: '12' },
	{ word: 'TREIZE', number: '13' },
	{ word: 'QUATORZE', number: '14' },
	{ word: 'QUINZE', number: '15' },
	{ word: 'SEIZE', number: '16' },
	{ word: 'DIX-SEPT', number: '17' },
	{ word: 'DIX-HUIT', number: '18' },
	{ word: 'DIX-NEUF', number: '19' },
	{ word: 'VINGT', number: '20' },
	{ word: 'TRENTE', number: '30' },
	{ word: 'QUARANTE', number: '40' },
	{ word: 'CINQUANTE', number: '50' },
	{ word: 'SOIXANTE', number: '60' },
	{ word: 'SOIXANTE-DIX', number: '70' },
	{ word: 'QUATRE-VINGT', number: '80' },
	{ word: 'QUATRE-VINGT-DIX', number: '90' },
	{ word: 'CENT', number: '100' },
	{ word: 'MILLE', number: '1000' },
];

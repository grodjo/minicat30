import { normalizeAnswer } from './answer-normalization';

const getBlanksCombinations = (blanksSplit: Array<string>): Array<string> => {
	return blanksSplit.reduce(
		(combinations$: Array<string>, nextStrPart: string): Array<string> => {
			if (combinations$.length === 0) {
				return [nextStrPart];
			}
			const lastCombination = combinations$[combinations$.length - 1];
			const nextCombination = [lastCombination, nextStrPart].join(' ');
			return [...combinations$, nextCombination];
		},
		[]
	);
};

const getAttemptsBlankCombinations = (answer: string): Array<string> => {
	let allCombinations: Array<string> = [];
	const attemptBlanksSplit = answer.split(' ');
	while (attemptBlanksSplit.length > 0) {
		allCombinations = [
			...allCombinations,
			...getBlanksCombinations(attemptBlanksSplit),
		];
		attemptBlanksSplit.shift();
	}
	return allCombinations;
};

export const checkIfAttemptIsValid = (
	answer: string,
	acceptedAnswer: string
): boolean => {
	const normalizedAttempt = normalizeAnswer(answer);
	const attemptBlanksCombinations = getAttemptsBlankCombinations(
		normalizedAttempt
	);
	
	return attemptBlanksCombinations.includes(normalizeAnswer(acceptedAnswer));
};

/**
 * Valide une tentative de réponse contre une liste de réponses acceptées
 * @param answer La réponse saisie par l'utilisateur
 * @param acceptedAnswers Liste des réponses acceptées
 * @returns true si la réponse est valide, false sinon
 */
export const validateAnswer = (answer: string, acceptedAnswers: string[]): boolean => {
	if (!answer || !acceptedAnswers || acceptedAnswers.length === 0) {
		return false;
	}

	// Tester la réponse contre chaque réponse acceptée
	return acceptedAnswers.some(acceptedAnswer => 
		checkIfAttemptIsValid(answer, acceptedAnswer)
	);
};

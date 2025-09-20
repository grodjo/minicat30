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
	acceptedAnswer: string,
	strictMode: boolean = false
): boolean => {
	const normalizedAttempt = normalizeAnswer(answer);
	const normalizedAcceptedAnswer = normalizeAnswer(acceptedAnswer);
	
	if (strictMode) {
		// Mode strict : égalité exacte après normalisation
		return normalizedAttempt === normalizedAcceptedAnswer;
	} else {
		// Mode inclusif : la réponse acceptée doit être incluse dans la tentative
		const attemptBlanksCombinations = getAttemptsBlankCombinations(
			normalizedAttempt
		);
		return attemptBlanksCombinations.includes(normalizedAcceptedAnswer);
	}
};

/**
 * Valide une tentative de réponse contre une liste de réponses acceptées
 * @param answer La réponse saisie par l'utilisateur
 * @param acceptedAnswers Liste des réponses acceptées
 * @param strictMode Mode de validation strict (true) ou inclusif (false, par défaut)
 * @returns true si la réponse est valide, false sinon
 */
export const validateAnswer = (
	answer: string, 
	acceptedAnswers: string[], 
	strictMode: boolean = false
): boolean => {
	if (!answer || !acceptedAnswers || acceptedAnswers.length === 0) {
		return false;
	}

	// Tester la réponse contre chaque réponse acceptée
	return acceptedAnswers.some(acceptedAnswer => 
		checkIfAttemptIsValid(answer, acceptedAnswer, strictMode)
	);
};

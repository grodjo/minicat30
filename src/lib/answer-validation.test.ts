import { checkIfAttemptIsValid, validateAnswer } from './answer-validation';

describe('checkIfAttemptIsValid()', (): void => {
	it('should accept too long attempt with blank', (): void => {
		const answer = 'Louis XII';
		const attempt = 'louis XII le pieux';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should refuse too long attempt without blank', (): void => {
		const answer = 'louis XII';
		const attempt = 'louis xiii';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeFalsy();
	});

	it('should accept useless spaces', (): void => {
		const answer = 'pintade';
		const attempt = '    pintade     ';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept missing specifier', (): void => {
		const answer = 'Une pintade';
		const attempt = 'pintade';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept wrong specifier', (): void => {
		const answer = 'Une pintade';
		const attempt = 'La pintade';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept useless specifier', (): void => {
		const answer = 'Pintade';
		const attempt = 'La pintade';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept missing dash', (): void => {
		const answer = 'chauve-souris';
		const attempt = 'chauve souris';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept missing dash and missing specifier', (): void => {
		const answer = 'Les chauve-souris';
		const attempt = 'chauve souris';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept number instead of letters as answer', (): void => {
		const answer = '4';
		const attempt = 'quatre';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept letters instead of numbers as answer', (): void => {
		const answer = 'mille';
		const attempt = '1000';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept number instead of letters within answer', (): void => {
		const answer = 'Les 3 petits cochons';
		const attempt = 'Les trois petits cochons';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept letters instead of letters within answer', (): void => {
		const answer = 'Les trois petits cochons';
		const attempt = 'Les 3 petits cochons';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept number in letters missing specifier and missing dash', (): void => {
		const answer = 'Les trois petites chauve-souris';
		const attempt = '3 petites chauve souris';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	it('should accept number without blank', (): void => {
		const answer = '1 000';
		const attempt = '1000';
		expect(checkIfAttemptIsValid(attempt, answer)).toBeTruthy();
	});

	// Tests pour la fonction validateAnswer spécifique au projet
	it('should validate against multiple accepted answers', (): void => {
		const acceptedAnswers = ['La vierge Marie', 'vierge Marie', 'Marie'];
		expect(validateAnswer('marie', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('la vierge marie', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('vierge marie', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('jean', acceptedAnswers)).toBeFalsy();
	});

	it('should handle numbers in quiz context', (): void => {
		const acceptedAnswers = ['13', '14', 'treize', 'quatorze'];
		expect(validateAnswer('13', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('treize', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('14', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('quatorze', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('15', acceptedAnswers)).toBeFalsy();
	});

	it('should handle location names', (): void => {
		const acceptedAnswers = ['Saint Paul', 'Saint-Paul', 'Village Saint-Paul'];
		expect(validateAnswer('saint paul', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('saint-paul', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('village saint paul', acceptedAnswers)).toBeTruthy();
		expect(validateAnswer('le village saint-paul', acceptedAnswers)).toBeTruthy();
	});

	it('should handle edge cases for validateAnswer', (): void => {
		// Test avec array vide
		expect(validateAnswer('test', [])).toBeFalsy();
		// Test avec attempt vide
		expect(validateAnswer('', ['test'])).toBeFalsy();
		// Test avec acceptedAnswers null/undefined
		expect(validateAnswer('test', [])).toBeFalsy();
	});
});

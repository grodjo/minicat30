import { normalizeAnswer } from './answer-normalization';

describe('normalizeAnswer', () => {
	// Tests pour la suppression des accents français
	test('should remove French accents', () => {
		expect(normalizeAnswer('café')).toBe('cafe');
		expect(normalizeAnswer('théâtre')).toBe('theatre');
		expect(normalizeAnswer('forêt')).toBe('foret');
		expect(normalizeAnswer('naïf')).toBe('naif');
		expect(normalizeAnswer('tête')).toBe('tete');
	});

	// Tests pour les caractères spéciaux (œ, æ, &)
	test('should handle special characters', () => {
		expect(normalizeAnswer('bœuf')).toBe('boeuf');
		expect(normalizeAnswer('æsthétique')).toBe('aesthetique');
		expect(normalizeAnswer('pain & confiture')).toBe('pain et confiture');
		expect(normalizeAnswer('œuf & bacon')).toBe('oeuf et bacon');
	});

	// Tests pour la suppression des espaces/virgules en début et fin
	test('should trim spaces and commas', () => {
		expect(normalizeAnswer('  chien  ')).toBe('chien');
		expect(normalizeAnswer(', chat ,')).toBe('chat');
		expect(normalizeAnswer('  , oiseau , ')).toBe('oiseau');
	});

	// Tests pour la normalisation des cas
	test('should convert to lowercase', () => {
		expect(normalizeAnswer('CHIEN')).toBe('chien');
		expect(normalizeAnswer('Chat')).toBe('chat');
		expect(normalizeAnswer('MAISON')).toBe('maison');
	});

	// Tests pour la suppression des spécificateurs
	test('should remove French specifiers', () => {
		expect(normalizeAnswer('Un chien')).toBe('chien');
		expect(normalizeAnswer('Une maison')).toBe('maison');
		expect(normalizeAnswer('Le chat')).toBe('chat');
		expect(normalizeAnswer('La voiture')).toBe('voiture');
		expect(normalizeAnswer('Les enfants')).toBe('enfants');
		expect(normalizeAnswer('Des oiseaux')).toBe('oiseaux');
		expect(normalizeAnswer('Du pain')).toBe('pain');
		expect(normalizeAnswer('De la confiture')).toBe('confiture');
		expect(normalizeAnswer('Au cinéma')).toBe('cinema');
		expect(normalizeAnswer('Aux enfants')).toBe('enfants');
	});

	// Tests pour la conversion des mots-nombres
	test('should convert number words to digits', () => {
		expect(normalizeAnswer('deux chiens')).toBe('2 chiens');
		expect(normalizeAnswer('trois chats')).toBe('3 chats');
		expect(normalizeAnswer('dix maisons')).toBe('10 maisons');
		expect(normalizeAnswer('vingt voitures')).toBe('20 voitures');
	});

	// Tests pour la suppression des espaces dans les nombres
	test('should remove spaces in number sequences', () => {
		expect(normalizeAnswer('10 5')).toBe('105');
		expect(normalizeAnswer('1 2 3')).toBe('123');
		expect(normalizeAnswer('maison 10 5 chat')).toBe('maison 105 chat');
	});

	// Tests complexes combinant plusieurs transformations
	test('should handle complex combinations', () => {
		expect(normalizeAnswer('Le café avec deux sucres')).toBe('cafe avec 2 sucres');
		expect(normalizeAnswer('Une théière avec trois tasses')).toBe('theiere avec 3 tasses');
		expect(normalizeAnswer('Des forêts avec dix arbres')).toBe('forets avec 10 arbres');
		expect(normalizeAnswer('Un bœuf & deux vaches')).toBe('boeuf et 2 vaches');
	});

	// Tests pour les tirets et points
	test('should replace dashes and dots with spaces', () => {
		expect(normalizeAnswer('jean-paul')).toBe('jean paul');
		expect(normalizeAnswer('U.S.A')).toBe('u s a');
		expect(normalizeAnswer('self-control')).toBe('self control');
	});

	// Tests pour les cas spéciaux
	test('should handle special cases', () => {
		expect(normalizeAnswer('')).toBe('');
		expect(normalizeAnswer('   ')).toBe('');
		expect(normalizeAnswer('123')).toBe('123');
		expect(normalizeAnswer('abc def')).toBe('abc def');
	});

	// Tests combinés avec caractères spéciaux et accents
	test('should handle combined special characters and accents', () => {
		expect(normalizeAnswer('Bœuf à la française & légumes')).toBe('boeuf a la francaise et legumes');
		expect(normalizeAnswer('Æsthétique moderne')).toBe('aesthetique moderne');
		expect(normalizeAnswer(', Le bœuf & les œufs ,')).toBe('boeuf et les oeufs');
	});
});

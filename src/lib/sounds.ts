export enum EventSound {
	/** Interface sounds */
	buttonClick = 'ps2Login',              // Bouton "Go!" principal
	gameStart = 'duck',                    // Bouton "START/REPRENDRE"
	
	/** Navigation sounds */
	stepTransition = 'marioKartGridIntro', // Écran de transition nouvelle étape
	newSubStep = 'ps2Expand',              // Nouvelle sous-étape
	directionComplete = 'pokemonCaught',   // Fin étape de direction  
	
	/** Feedback sounds */
	enigmaSuccess = 'airHornWin',          // Énigme réussie
	bonusSuccess = 'dbzKiBlast',           // Bonus réussi
	enigmaFailed = 'wrong3',               // Énigme ratée
	bonusFailed = 'dbzGhost',              // Bonus raté
	hintRevealed = 'ps2Reveal',            // Indice révélé dans la modale
	
	/** Legacy sounds (unused in current implementation) */
	newStep = 'ps2Collapse',               // Ancienne nouvelle étape
	connection = 'ps2Connection',
	teleportation = 'dbzTeleportation',
	itemBox = 'marioKartItemBox',
	auraBurst = 'dbzAuraBurst',
	alarm = 'alarmEnd',
	victory = 'epicVictory',
	notification = 'ps2Notif',
	enable = 'ah',
	stop = 'scratchStop',
};

interface ISoundCache {
	[soundName: string]: HTMLAudioElement;
}

// Cache des éléments audio - créés à la demande pour optimiser les performances
const soundCache: ISoundCache = {};

// Fonction pour créer ou récupérer un élément audio du cache
const getAudioElement = (soundName: string): HTMLAudioElement | null => {
	// Vérification côté client
	if (typeof window === 'undefined') {
		return null;
	}

	// Si l'élément existe déjà dans le cache, le retourner
	if (soundCache[soundName]) {
		return soundCache[soundName];
	}

	// Créer un nouvel élément audio et l'ajouter au cache
	try {
		const audioElement = new Audio(`/sounds/${soundName}.mov`);
		audioElement.preload = 'auto'; // Précharger pour une lecture plus fluide
		soundCache[soundName] = audioElement;
		return audioElement;
	} catch (error) {
		console.warn(`Failed to create audio element for ${soundName}:`, error);
		return null;
	}
};

export const getEventSoundName = (eventName: EventSound): string => {
	return eventName;
};

export const playSound = (
	soundName: string,
	shouldPlay?: boolean
): void => {
	if (shouldPlay === false) return;

	const audioElement = getAudioElement(soundName);
	if (audioElement) {
		// Reset l'audio au début pour permettre de rejouer rapidement
		audioElement.currentTime = 0;
		audioElement.play().catch((error: unknown) => {
			console.warn(`Failed to play sound ${soundName}:`, error);
		});
	}
};

export const pauseSound = (soundName: string): void => {
	const audioElement = getAudioElement(soundName);
	if (audioElement) {
		audioElement.pause();
	}
};

// Fonction utilitaire pour jouer un son d'événement
export const playEventSound = (
	eventName: EventSound,
	shouldPlay?: boolean
): void => {
	playSound(eventName, shouldPlay);
};

// Fonction pour précharger tous les sons (optionnel - à appeler au démarrage de l'app)
export const preloadAllSounds = (): void => {
	if (typeof window === 'undefined') return;

	Object.values(EventSound).forEach((soundName) => {
		getAudioElement(soundName);
	});
};

// Fonction pour nettoyer le cache (utile lors du démontage de l'app)
export const clearSoundCache = (): void => {
	Object.values(soundCache).forEach((audioElement) => {
		audioElement.pause();
		audioElement.src = '';
	});
	Object.keys(soundCache).forEach((key) => {
		delete soundCache[key];
	});
};

export enum EventSound {
	/** Interface sounds */
	buttonClick = 'ps2Login',              // Bouton "Go!" principal
	startGame = 'duck',                    // Bouton "START/REPRENDRE" (renommé pour éviter conflit)
	
	/** Navigation sounds */
	stepTransition = 'marioKartGridIntro', // Écran de transition nouvelle étape
	newSubStep = 'ps2Expand',              // Nouvelle sous-étape
	directionComplete = 'pokemonCaught',   // Fin étape de direction  
	
	/** Feedback sounds */
	enigmaSuccess = 'airHornWin',          // Énigme réussie
	bonusSuccess = 'dbzKiBlast',           // Bonus réussi
	enigmaWrongAnswer = 'wrong1',          // Énigme ratée (temporaire - sera 'duck' dans l'usage)
	directionWrongAnswer = 'wrong3',       // Direction ratée (utilise "wrong3")
	bonusFailed = 'dbzGhost',              // Bonus raté
	hintPenalty = 'wrong2',                // Indice utilisé avec pénalité (temporaire - sera 'ah' dans l'usage)
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
	stop = 'scratchStop',
};

interface ISoundCache {
	[soundName: string]: HTMLAudioElement;
}

// Cache des éléments audio - un seul élément par son pour éviter la surcharge
const soundCache: ISoundCache = {};

// Fonction pour créer un élément audio simple et optimisé
const getAudioElement = (soundName: string): HTMLAudioElement | null => {
	// Vérification côté client
	if (typeof window === 'undefined') {
		return null;
	}

	// Si l'élément existe déjà dans le cache, le retourner
	if (soundCache[soundName]) {
		return soundCache[soundName];
	}

	// Créer un nouvel élément audio optimisé
	try {
		const audioElement = new Audio(`/sounds/${soundName}.mov`);
		audioElement.preload = 'metadata'; // Précharger seulement les métadonnées pour la rapidité
		audioElement.volume = 1.0;
		
		soundCache[soundName] = audioElement;
		return audioElement;
	} catch (error) {
		console.warn(`Failed to create audio element for ${soundName}:`, error);
		return null;
	}
};

export const playSound = (soundName: string): void => {
	const audioElement = getAudioElement(soundName);
	if (audioElement) {
		// Reset et jouer immédiatement - version ultra simplifiée
		audioElement.currentTime = 0;
		audioElement.play().catch((error: unknown) => {
			console.warn(`Failed to play sound ${soundName}:`, error);
		});
	}
};

export const pauseSound = (soundName: string): void => {
	if (!soundCache[soundName]) return;
	
	// Mettre en pause l'élément audio
	soundCache[soundName].pause();
};

// Fonction principale pour jouer un son d'événement
export const playEventSound = (eventName: EventSound): void => {
	playSound(eventName);
};

// Fonction pour nettoyer le cache
export const clearSoundCache = (): void => {
	Object.values(soundCache).forEach((audioElement) => {
		audioElement.pause();
		audioElement.src = '';
	});
	
	Object.keys(soundCache).forEach((key) => {
		delete soundCache[key];
	});
};

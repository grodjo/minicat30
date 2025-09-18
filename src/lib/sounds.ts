export enum SoundName {
  // Sounds available in /public/sounds/
  AH = 'ah',
  AIR_HORN_WIN = 'airHornWin',
  ALARM_END = 'alarmEnd',
  DBZ_AURA_BURST = 'dbzAuraBurst',
  DBZ_GHOST = 'dbzGhost',
  DBZ_KI_BLAST = 'dbzKiBlast',
  DBZ_TELEPORTATION = 'dbzTeleportation',
  DUCK = 'duck',
  EPIC_VICTORY = 'epicVictory',
  MARIO_KART_GRID_INTRO = 'marioKartGridIntro',
  MARIO_KART_ITEM_BOX = 'marioKartItemBox',
  POKEMON_CAUGHT = 'pokemonCaught',
  PS2_COLLAPSE = 'ps2Collapse',
  PS2_CONNECTION = 'ps2Connection',
  PS2_EXPAND = 'ps2Expand',
  PS2_LOGIN = 'ps2Login',
  PS2_NOTIF = 'ps2Notif',
  PS2_REVEAL = 'ps2Reveal',
  SCRATCH_STOP = 'scratchStop',
  WRONG1 = 'wrong1',
  WRONG2 = 'wrong2',
  WRONG3 = 'wrong3',
}

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

// Fonction principale pour jouer un son
export const playSound = (soundName: SoundName): void => {
	const audioElement = getAudioElement(soundName);
	if (audioElement) {
		// Reset et jouer immédiatement
		audioElement.currentTime = 0;
		audioElement.play().catch((error: unknown) => {
			console.warn(`Failed to play sound ${soundName}:`, error);
		});
	}
};

export const pauseSound = (soundName: SoundName): void => {
	if (!soundCache[soundName]) return;
	
	// Mettre en pause l'élément audio
	soundCache[soundName].pause();
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

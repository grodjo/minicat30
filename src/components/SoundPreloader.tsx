'use client';

import { useEffect } from 'react';

export const SoundPreloader = () => {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    // Gestion complète de l'audio dans un seul endroit
    const initializeAudio = () => {
      if (typeof window === 'undefined') return;
      
      try {
        console.log('🔊 Initialisation du système audio...');
        
        // 1. Précharger les sons critiques (métadonnées seulement)
        const criticalSounds = ['ps2Login', 'duck', 'airHornWin'];
        
        criticalSounds.forEach((soundName) => {
          const audio = new Audio(`/sounds/${soundName}.mov`);
          audio.preload = 'metadata';
          audio.volume = 0; // Volume à 0 pour éviter les bruits parasites
        });
        
        // 2. Configurer le déverrouillage audio au premier contact utilisateur
        const unlockAudio = () => {
          // Jouer un son silencieux pour débloquer l'audio context
          const unlockSound = new Audio();
          unlockSound.volume = 0;
          unlockSound.play().catch(() => {
            // Ignorer les erreurs, c'est juste pour débloquer
          });
          
          // Supprimer les listeners après le premier déclenchement
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
          
          console.log('🔓 Audio déverrouillé');
        };

        // Attacher les listeners pour le déverrouillage
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        
        console.log('✅ Système audio initialisé');
        
        // Retourner la fonction de cleanup
        return () => {
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
        };
        
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'initialisation audio:', error);
        return undefined;
      }
    };

    // Délai pour éviter les problèmes de performance au démarrage
    const timeoutId = setTimeout(() => {
      cleanup = initializeAudio();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement
};

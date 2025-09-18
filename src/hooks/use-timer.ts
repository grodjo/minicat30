'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatTimerTime } from '@/lib/time-formatting';

export const useTimer = (startedAt: string | null, sessionId?: string, stepName?: string) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [showPenaltyAnimation, setShowPenaltyAnimation] = useState(false);
  const [lastPenaltyMinutes, setLastPenaltyMinutes] = useState(1);
  const [initialPenaltiesLoaded, setInitialPenaltiesLoaded] = useState(false);

  // Charger les pénalités existantes depuis la base de données
  useEffect(() => {
    if (!sessionId || initialPenaltiesLoaded) return;

    const loadExistingPenalties = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}/penalties`);
        if (response.ok) {
          const data = await response.json();
          setPenaltyTime(data.totalPenaltyTimeMs || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des pénalités:', error);
      } finally {
        setInitialPenaltiesLoaded(true);
      }
    };

    loadExistingPenalties();
  }, [sessionId, initialPenaltiesLoaded]);

  useEffect(() => {
    if (!startedAt || !initialPenaltiesLoaded) return;

    const startTime = new Date(startedAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime + penaltyTime;
      setElapsedTime(elapsed);
    };

    // Mise à jour immédiate
    updateTimer();
    
    // Mise à jour chaque seconde
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt, penaltyTime, initialPenaltiesLoaded]);

  // Fonction pour recharger les pénalités depuis la BDD
  const reloadPenalties = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/session/${sessionId}/penalties`);
      if (response.ok) {
        const data = await response.json();
        setPenaltyTime(data.totalPenaltyTimeMs || 0);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des pénalités:', error);
    }
  }, [sessionId]);

  // Fonction pour déclencher seulement l'animation de pénalité (utilisée quand la pénalité est déjà gérée côté serveur)
  const showPenaltyAnimationOnly = useCallback((minutes: number = 1) => {
    setLastPenaltyMinutes(minutes);
    setShowPenaltyAnimation(true);
    
    // Masquer l'animation après 2 secondes
    setTimeout(() => {
      setShowPenaltyAnimation(false);
    }, 2000);
  }, []);

  // Fonction pour ajouter une pénalité de temps
  const addTimePenalty = useCallback(async (minutes: number = 1) => {
    setLastPenaltyMinutes(minutes);
    setShowPenaltyAnimation(true);
    
    // Sauvegarde en base de données si on a sessionId et stepName
    if (sessionId && stepName) {
      try {
        const response = await fetch(`/api/session/${sessionId}/add-penalty`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stepName,
            penaltyMinutes: minutes
          }),
        });
        
        if (!response.ok) {
          console.error('Erreur lors de la sauvegarde de la pénalité en BDD');
          return;
        }

        // Recharger les pénalités depuis la BDD après sauvegarde réussie
        const penaltiesResponse = await fetch(`/api/session/${sessionId}/penalties`);
        if (penaltiesResponse.ok) {
          const data = await penaltiesResponse.json();
          setPenaltyTime(data.totalPenaltyTimeMs || 0);
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la pénalité:', error);
      }
    }
    
    // Masquer l'animation après 2 secondes
    setTimeout(() => {
      setShowPenaltyAnimation(false);
    }, 2000);
  }, [sessionId, stepName]);

  // Formatage du temps au format H:MM:SS
  const elapsedSeconds = Math.floor(elapsedTime / 1000);

  return {
    formattedTime: formatTimerTime(elapsedSeconds),
    addTimePenalty,
    showPenaltyAnimationOnly,
    reloadPenalties,
    showPenaltyAnimation,
    lastPenaltyMinutes
  };
};

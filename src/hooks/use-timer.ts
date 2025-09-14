'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatTimerTime } from '@/lib/time-formatting';

export const useTimer = (startedAt: string | null) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [showPenaltyAnimation, setShowPenaltyAnimation] = useState(false);

  useEffect(() => {
    if (!startedAt) return;

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
  }, [startedAt, penaltyTime]);

  // Fonction pour ajouter une pénalité de temps
  const addTimePenalty = useCallback((minutes: number = 1) => {
    const penaltyMs = minutes * 60 * 1000;
    setPenaltyTime(prev => prev + penaltyMs);
    setShowPenaltyAnimation(true);
    
    // Masquer l'animation après 2 secondes
    setTimeout(() => {
      setShowPenaltyAnimation(false);
    }, 2000);
  }, []);

  // Formatage du temps au format H:MM:SS
  const elapsedSeconds = Math.floor(elapsedTime / 1000);

  return {
    formattedTime: formatTimerTime(elapsedSeconds),
    addTimePenalty,
    showPenaltyAnimation
  };
};

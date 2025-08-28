'use client';

import { useState, useEffect, useCallback } from 'react';

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

  // Formatage du temps au format MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    formattedTime: formatTime(elapsedTime),
    addTimePenalty,
    showPenaltyAnimation
  };
};

'use client';

import { useState, useEffect } from 'react';

export const useTimer = (startedAt: string | null) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const startTime = new Date(startedAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);
    };

    // Mise à jour immédiate
    updateTimer();
    
    // Mise à jour chaque seconde
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  // Formatage du temps au format MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return formatTime(elapsedTime);
};

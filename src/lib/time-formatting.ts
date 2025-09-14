/**
 * Format time for timer display (H:MM:SS format)
 * @param seconds - Total seconds elapsed
 * @returns Formatted time string in H:MM:SS format
 */
export function formatTimerTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format time for scoreboard display (contextual format)
 * @param totalTimeMs - Total time in milliseconds
 * @returns Formatted time string in human-readable format
 */
export function formatScoreboardTime(totalTimeMs: number): string {
  const totalSeconds = Math.floor(totalTimeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    // Format: "2h 24min" (omit minutes if 0)
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  } else {
    // Format: "2min 24s" (omit seconds if 0, omit minutes if 0)
    if (minutes > 0) {
      return seconds > 0 ? `${minutes}min ${seconds}s` : `${minutes}min`;
    } else {
      return `${seconds}s`;
    }
  }
}

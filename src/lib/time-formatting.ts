const INITIAL_DELAY_SECONDS = 7;

/**
 * Format time for timer display (H:MM:SS format)
 * @param seconds - Total seconds elapsed
 * @returns Formatted time string in H:MM:SS format
 */
export function formatTimerTime(seconds: number): string {
  const correctedSeconds = seconds - INITIAL_DELAY_SECONDS; // Take initial delay into account
  if (correctedSeconds < 0) return '00:00:00';
  const hours = Math.floor(correctedSeconds / 3600);
  const minutes = Math.floor((correctedSeconds % 3600) / 60);
  const remainingSeconds = correctedSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format time for scoreboard display (contextual format)
 * @param totalTimeMs - Total time in milliseconds
 * @returns Formatted time string in human-readable format
 */
export function formatScoreboardTime(totalTimeMs: number): string {
  const correctedSeconds = Math.floor(totalTimeMs / 1000) - INITIAL_DELAY_SECONDS; // Take initial delay into account
  if (correctedSeconds < 0) return '0s';
  const hours = Math.floor(correctedSeconds / 3600);
  const minutes = Math.floor((correctedSeconds % 3600) / 60);
  const seconds = correctedSeconds % 60;
  
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

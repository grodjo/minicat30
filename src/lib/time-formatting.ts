const INITIAL_DELAY_SECONDS = 7;

/**
 * Format time for timer display (H:MM:SS format)
 * @param seconds - Total seconds elapsed
 * @returns Formatted time string in H:MM:SS format
 */
export function formatTimerTime(seconds: number): string {
  const correctedSeconds = seconds - INITIAL_DELAY_SECONDS; // Take initial delay into account
  
  // Gérer les temps négatifs (rare, mais possible avec un gros bonus)
  const isNegative = correctedSeconds < 0;
  const absoluteSeconds = Math.abs(correctedSeconds);
  
  const hours = Math.floor(absoluteSeconds / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);
  const remainingSeconds = absoluteSeconds % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  return isNegative ? `-${formattedTime}` : formattedTime;
}

/**
 * Format time for penalty display (for pure penalty times without initial delay correction)
 * @param totalTimeMs - Total time in milliseconds
 * @returns Formatted time string in human-readable format
 */
export function formatPenaltyTime(totalTimeMs: number): string {
  const totalSeconds = Math.floor(totalTimeMs / 1000);
  if (totalSeconds === 0) return '0s';
  
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

/**
 * Format time for scoreboard display (contextual format)
 * @param totalTimeMs - Total time in milliseconds
 * @returns Formatted time string in human-readable format
 */
export function formatScoreboardTime(totalTimeMs: number): string {
  const correctedSeconds = Math.floor(totalTimeMs / 1000) - INITIAL_DELAY_SECONDS; // Take initial delay into account
  
  // Gérer les temps négatifs (rare, mais possible avec un gros bonus)
  const isNegative = correctedSeconds < 0;
  const absoluteSeconds = Math.abs(correctedSeconds);
  
  const hours = Math.floor(absoluteSeconds / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);
  const seconds = absoluteSeconds % 60;
  
  let formattedTime: string;
  if (hours > 0) {
    // Format: "2h 24min" (omit minutes if 0)
    formattedTime = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  } else {
    // Format: "2min 24s" (omit seconds if 0, omit minutes if 0)
    if (minutes > 0) {
      formattedTime = seconds > 0 ? `${minutes}min ${seconds}s` : `${minutes}min`;
    } else {
      formattedTime = `${seconds}s`;
    }
  }
  
  return isNegative ? `-${formattedTime}` : formattedTime;
}

import { fatbearFriendsSteps } from "./fatbear-friends";
import { minicatBirthdaySteps } from "./minicat-birthday";

const availableGameSteps = {
  'minicat-birthday': minicatBirthdaySteps,
  'fatbear-friends': fatbearFriendsSteps,
};

export function getSteps() {
  // This function should only be called on the server side
  if (typeof window !== 'undefined') {
    throw new Error('getSteps() should only be called on the server side');
  }

  const gameStepsName = process.env.GAME_STEPS_NAME;

  if (!gameStepsName) {
    throw new Error("GAME_STEPS_NAME is not defined in environment variables");
  }
  
  if (!availableGameSteps?.[gameStepsName as keyof typeof availableGameSteps]) {
    throw new Error(`Game steps "${gameStepsName}" are not available`);
  }

  return availableGameSteps[gameStepsName as keyof typeof availableGameSteps];
}

// For compatibility, we also export directly (but only on the server side)
export const steps = typeof window === 'undefined' ? getSteps() : [];


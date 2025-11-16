'use client';

interface TimerProps {
  elapsedTime: string;
  showPenaltyAnimation?: boolean;
  showBonusAnimation?: boolean;
  penaltyMinutes?: number; // Nombre de minutes de pénalité à afficher
  bonusMinutes?: number; // Nombre de minutes de bonus à afficher
  size?: 'small' | 'large';
  className?: string;
}

export const Timer = ({ 
  elapsedTime, 
  showPenaltyAnimation, 
  showBonusAnimation,
  penaltyMinutes = 1,
  bonusMinutes = 3,
  size = 'small',
  className = '' 
}: TimerProps) => {
  const sizeClasses = size === 'large' 
    ? 'text-4xl font-black px-4 py-4 rounded-2xl border-2 w-68' // Largeur fixe pour le grand timer
    : 'text-sm font-semibold px-3 py-2 rounded-full border w-28'; // Largeur fixe pour le petit timer
    
  const animationIndicatorSize = size === 'large' ? 'text-4xl -bottom-8' : 'text-3xl -bottom-10';

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Indicateur de pénalité */}
      {showPenaltyAnimation && (
        <div className={`absolute ${animationIndicatorSize} left-1/2 transform -translate-x-1/2 text-red-400 font-black pointer-events-none z-20 animate-penalty-burst`}>
          +{penaltyMinutes}min ⚠️
        </div>
      )}
      
      {/* Indicateur de bonus */}
      {showBonusAnimation && (
        <div className={`absolute ${animationIndicatorSize} left-1/2 transform -translate-x-1/2 text-green-400 font-black pointer-events-none z-20 animate-bonus-burst`}>
          -{bonusMinutes}min ✨
        </div>
      )}
      
      {/* Timer principal */}
      <div className={`inline-block backdrop-blur-md transition-all duration-500 text-center ${sizeClasses} ${
        showPenaltyAnimation 
          ? 'text-red-200 bg-red-500/40 border-red-400/80 scale-110 shadow-2xl shadow-red-500/40 animate-timer-shake'
          : showBonusAnimation
          ? 'text-green-200 bg-green-500/40 border-green-400/80 scale-110 shadow-2xl shadow-green-500/40 animate-timer-bounce'
          : 'text-yellow-300 bg-yellow-400/20 border-yellow-400/50'
      }`}>
        ⏱️ {elapsedTime}
      </div>
    </div>
  );
};

'use client';

interface QuizHeaderProps {
  pseudo: string | null;
  sessionId: string;
  elapsedTime: string;
  showPenaltyAnimation?: boolean;
}

export const QuizHeader = ({ pseudo, sessionId, elapsedTime, showPenaltyAnimation }: QuizHeaderProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-10">
      <div className="flex justify-between items-center">
        <div className="text-violet-200 text-sm font-semibold bg-white/10 backdrop-blur-md px-3 py-2 rounded-full">
          👤 {pseudo ? pseudo : `Session ${sessionId.slice(-8)}`}
        </div>
        <div className="relative flex items-center">
          {/* Indicateur de pénalité à gauche */}
          {showPenaltyAnimation && (
            <div className="absolute -left-16 text-red-400 font-black text-3xl pointer-events-none z-20 animate-penalty-burst">
              +1
            </div>
          )}
          
          {/* Timer avec animation de shake et couleur rouge */}
          <div className={`text-sm font-semibold backdrop-blur-md px-3 py-2 rounded-full border transition-all duration-500 ${
            showPenaltyAnimation 
              ? 'text-red-200 bg-red-500/40 border-red-400/80 scale-110 shadow-xl shadow-red-500/30 animate-timer-shake' 
              : 'text-yellow-300 bg-yellow-400/10 border-yellow-400/30'
          }`}>
            ⏱️ {elapsedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

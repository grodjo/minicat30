'use client';

interface QuizHeaderProps {
  pseudo: string | null;
  sessionId: string;
  elapsedTime: string;
}

export default function QuizHeader({ pseudo, sessionId, elapsedTime }: QuizHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-10">
      <div className="flex justify-between items-center">
        <div className="text-violet-200 text-sm font-semibold bg-white/10 backdrop-blur-md px-3 py-2 rounded-full">
          👤 {pseudo ? pseudo : `Session ${sessionId.slice(-8)}`}
        </div>
        <div className="text-yellow-300 text-sm font-semibold bg-yellow-400/10 backdrop-blur-md px-3 py-2 rounded-full border border-yellow-400/30">
          ⏱️ {elapsedTime}
        </div>
      </div>
    </div>
  );
}

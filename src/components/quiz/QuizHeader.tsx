'use client';

interface QuizHeaderProps {
  pseudo: string | null;
  sessionId: string;
}

export const QuizHeader = ({ pseudo, sessionId }: QuizHeaderProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-10">
      <div className="flex justify-between items-center">
        <div className="text-violet-200 text-sm font-semibold bg-white/10 backdrop-blur-md px-3 py-2 rounded-full">
          👤 {pseudo ? pseudo : `Session ${sessionId.slice(-8)}`}
        </div>
      </div>
    </div>
  );
};

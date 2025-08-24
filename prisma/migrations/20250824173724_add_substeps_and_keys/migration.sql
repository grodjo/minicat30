-- AlterTable
ALTER TABLE "QuestionSession" ADD COLUMN     "bonusAttemptedAt" TIMESTAMP(3),
ADD COLUMN     "bonusCorrect" BOOLEAN,
ADD COLUMN     "collectedKey" TEXT,
ADD COLUMN     "currentSubStep" TEXT NOT NULL DEFAULT 'direction',
ADD COLUMN     "directionCompletedAt" TIMESTAMP(3),
ADD COLUMN     "enigmaCompletedAt" TIMESTAMP(3),
ADD COLUMN     "keyCompletedAt" TIMESTAMP(3);

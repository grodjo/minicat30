/*
  Warnings:

  - You are about to drop the `Attempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_questionSessionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSession" DROP CONSTRAINT "QuestionSession_gameSessionId_fkey";

-- DropTable
DROP TABLE "Attempt";

-- DropTable
DROP TABLE "QuestionSession";

-- CreateTable
CREATE TABLE "StepSession" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepRank" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "hasUsedHint" BOOLEAN NOT NULL DEFAULT false,
    "currentSubStep" TEXT NOT NULL DEFAULT 'direction',
    "directionCompletedAt" TIMESTAMP(3),
    "enigmaCompletedAt" TIMESTAMP(3),
    "bonusAttemptedAt" TIMESTAMP(3),
    "isBonusCorrect" BOOLEAN,
    "keyCompletedAt" TIMESTAMP(3),
    "collectedKey" TEXT,

    CONSTRAINT "StepSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StepSession_gameSessionId_stepRank_idx" ON "StepSession"("gameSessionId", "stepRank");

-- CreateIndex
CREATE UNIQUE INDEX "StepSession_gameSessionId_stepName_key" ON "StepSession"("gameSessionId", "stepName");

-- AddForeignKey
ALTER TABLE "StepSession" ADD CONSTRAINT "StepSession_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

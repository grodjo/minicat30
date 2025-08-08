/*
  Warnings:

  - You are about to drop the column `sessionId` on the `QuestionSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameSessionId,stepName]` on the table `QuestionSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameSessionId` to the `QuestionSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestionSession" DROP CONSTRAINT "QuestionSession_sessionId_fkey";

-- DropIndex
DROP INDEX "QuestionSession_sessionId_order_idx";

-- DropIndex
DROP INDEX "QuestionSession_sessionId_stepName_key";

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "questionSessionId" TEXT,
ALTER COLUMN "sessionId" DROP NOT NULL,
ALTER COLUMN "stepName" DROP NOT NULL,
ALTER COLUMN "usedHints" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuestionSession" DROP COLUMN "sessionId",
ADD COLUMN     "gameSessionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Attempt_questionSessionId_idx" ON "Attempt"("questionSessionId");

-- CreateIndex
CREATE INDEX "QuestionSession_gameSessionId_order_idx" ON "QuestionSession"("gameSessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSession_gameSessionId_stepName_key" ON "QuestionSession"("gameSessionId", "stepName");

-- AddForeignKey
ALTER TABLE "QuestionSession" ADD CONSTRAINT "QuestionSession_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionSessionId_fkey" FOREIGN KEY ("questionSessionId") REFERENCES "QuestionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

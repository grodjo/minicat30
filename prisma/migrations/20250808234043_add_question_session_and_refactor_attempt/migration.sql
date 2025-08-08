-- DropIndex
DROP INDEX "Attempt_sessionId_isCorrect_idx";

-- DropIndex
DROP INDEX "Attempt_sessionId_stepName_key";

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "QuestionSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "QuestionSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionSession_sessionId_order_idx" ON "QuestionSession"("sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSession_sessionId_stepName_key" ON "QuestionSession"("sessionId", "stepName");

-- CreateIndex
CREATE INDEX "Attempt_sessionId_stepName_idx" ON "Attempt"("sessionId", "stepName");

-- AddForeignKey
ALTER TABLE "QuestionSession" ADD CONSTRAINT "QuestionSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

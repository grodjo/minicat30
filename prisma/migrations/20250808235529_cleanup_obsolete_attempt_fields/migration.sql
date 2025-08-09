/*
  Warnings:

  - You are about to drop the column `answeredAt` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `stepName` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `usedHints` on the `Attempt` table. All the data in the column will be lost.
  - Made the column `answer` on table `Attempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `questionSessionId` on table `Attempt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_sessionId_fkey";

-- DropIndex
DROP INDEX "Attempt_sessionId_stepName_idx";

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "answeredAt",
DROP COLUMN "sessionId",
DROP COLUMN "startedAt",
DROP COLUMN "stepName",
DROP COLUMN "usedHints",
ALTER COLUMN "answer" SET NOT NULL,
ALTER COLUMN "questionSessionId" SET NOT NULL;

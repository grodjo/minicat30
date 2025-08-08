-- AlterTable
ALTER TABLE "QuestionSession" ADD COLUMN     "usedHints" JSONB NOT NULL DEFAULT '[]';

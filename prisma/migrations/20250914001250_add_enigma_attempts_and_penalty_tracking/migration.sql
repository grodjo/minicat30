-- AlterTable
ALTER TABLE "StepSession" ADD COLUMN     "enigmaAttemptsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penaltyTimeMs" INTEGER NOT NULL DEFAULT 0;

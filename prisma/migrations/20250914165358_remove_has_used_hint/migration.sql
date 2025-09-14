-- Remove the redundant hasUsedHint column (can be deduced from hint indexes)
ALTER TABLE "StepSession" DROP COLUMN "hasUsedHint";

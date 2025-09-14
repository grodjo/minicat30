-- Add separate hint indexes for direction and enigma substeps
ALTER TABLE "StepSession" ADD COLUMN "currentHintIndex" INT NOT NULL DEFAULT 0;
ALTER TABLE "StepSession" ADD COLUMN "directionHintIndex" INT NOT NULL DEFAULT 0;
ALTER TABLE "StepSession" ADD COLUMN "enigmaHintIndex" INT NOT NULL DEFAULT 0;

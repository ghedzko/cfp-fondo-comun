/*
  Warnings:

  - Added the required column `anio` to the `curso_periodos` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns with default values
ALTER TABLE "public"."curso_periodos" 
ADD COLUMN "anio" INTEGER NOT NULL DEFAULT 2025,
ADD COLUMN "mesesHabilitados" INTEGER[] DEFAULT '{3,4,5,6}';

-- Step 2: Update existing records with appropriate values
UPDATE "public"."curso_periodos" 
SET "mesesHabilitados" = '{3,4,5,6}', "anio" = 2025 
WHERE "mesesHabilitados" IS NULL OR "anio" IS NULL;

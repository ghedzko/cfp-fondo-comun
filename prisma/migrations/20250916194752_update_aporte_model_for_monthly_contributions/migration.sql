/*
  Warnings:

  - A unique constraint covering the columns `[estudianteId,cursoPeriodoId,mes,anio]` on the table `aportes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anio` to the `aportes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cursoPeriodoId` to the `aportes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mes` to the `aportes` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Delete existing aportes data (test data only)
DELETE FROM "public"."aportes";

-- Step 2: AlterTable - Add new columns
ALTER TABLE "public"."aportes" ADD COLUMN     "anio" INTEGER NOT NULL,
ADD COLUMN     "cursoPeriodoId" TEXT NOT NULL,
ADD COLUMN     "mes" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "aportes_estudianteId_cursoPeriodoId_mes_anio_key" ON "public"."aportes"("estudianteId", "cursoPeriodoId", "mes", "anio");

-- AddForeignKey
ALTER TABLE "public"."aportes" ADD CONSTRAINT "aportes_cursoPeriodoId_fkey" FOREIGN KEY ("cursoPeriodoId") REFERENCES "public"."curso_periodos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

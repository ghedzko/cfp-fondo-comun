/*
  Warnings:

  - You are about to drop the `aportes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curso_periodos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cursos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estudiantes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facturas_curso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `matriculas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."aportes" DROP CONSTRAINT "aportes_cursoPeriodoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."aportes" DROP CONSTRAINT "aportes_estudianteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."curso_periodos" DROP CONSTRAINT "curso_periodos_cursoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."facturas_curso" DROP CONSTRAINT "facturas_curso_cursoPeriodoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."matriculas" DROP CONSTRAINT "matriculas_cursoPeriodoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."matriculas" DROP CONSTRAINT "matriculas_estudianteId_fkey";

-- DropTable
DROP TABLE "public"."aportes";

-- DropTable
DROP TABLE "public"."curso_periodos";

-- DropTable
DROP TABLE "public"."cursos";

-- DropTable
DROP TABLE "public"."estudiantes";

-- DropTable
DROP TABLE "public"."facturas_curso";

-- DropTable
DROP TABLE "public"."matriculas";

-- DropEnum
DROP TYPE "public"."EstadoFactura";

-- DropEnum
DROP TYPE "public"."EstadoMatricula";

-- DropEnum
DROP TYPE "public"."MetodoPago";

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_periods" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "enabledMonths" INTEGER[],
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coursePeriodId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contributions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coursePeriodId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "concept" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'CASH',
    "receipt" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_invoices" (
    "id" TEXT NOT NULL,
    "coursePeriodId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_dni_key" ON "public"."students"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_coursePeriodId_key" ON "public"."enrollments"("studentId", "coursePeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_studentId_coursePeriodId_month_year_key" ON "public"."contributions"("studentId", "coursePeriodId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "course_invoices_coursePeriodId_month_year_key" ON "public"."course_invoices"("coursePeriodId", "month", "year");

-- AddForeignKey
ALTER TABLE "public"."course_periods" ADD CONSTRAINT "course_periods_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_coursePeriodId_fkey" FOREIGN KEY ("coursePeriodId") REFERENCES "public"."course_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contributions" ADD CONSTRAINT "contributions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contributions" ADD CONSTRAINT "contributions_coursePeriodId_fkey" FOREIGN KEY ("coursePeriodId") REFERENCES "public"."course_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_invoices" ADD CONSTRAINT "course_invoices_coursePeriodId_fkey" FOREIGN KEY ("coursePeriodId") REFERENCES "public"."course_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

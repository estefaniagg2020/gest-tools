/*
  Warnings:

  - You are about to drop the column `spaId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `Spa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Therapist` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `businessId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('manager', 'therapist', 'admin');

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_spaId_fkey";

-- DropForeignKey
ALTER TABLE "Therapist" DROP CONSTRAINT "Therapist_spaId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "spaId",
ADD COLUMN     "businessId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Spa";

-- DropTable
DROP TABLE "Therapist";

-- DropEnum
DROP TYPE "TherapistRole";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "themeColor" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GestorConfig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "numberOfPeople" INTEGER NOT NULL DEFAULT 0,
    "businessType" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GestorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "linkedInUrl" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "weeklyHours" DOUBLE PRECISION,
    "color" TEXT,
    "role" "EmployeeRole" NOT NULL DEFAULT 'therapist',
    "businessId" TEXT NOT NULL,
    "defaultWorkStartHour" INTEGER,
    "defaultWorkEndHour" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GestorConfig_businessId_key" ON "GestorConfig"("businessId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GestorConfig" ADD CONSTRAINT "GestorConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

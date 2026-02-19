/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `GestorConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "origin" TEXT NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "GestorConfig" ADD COLUMN     "bookingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "depositPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "depositRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "publicPhoneNumber" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "socialLinks" JSONB;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "depositAmount" DOUBLE PRECISION,
ADD COLUMN     "onlineBookingEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "GestorConfig_slug_key" ON "GestorConfig"("slug");

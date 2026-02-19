-- AlterTable
ALTER TABLE "GestorConfig" ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessPopulation" TEXT,
ADD COLUMN     "isCanarias" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxId" TEXT;

-- DropIndex
DROP INDEX "Bono_serviceCategoryId_idx";

-- AlterTable
ALTER TABLE "Bono" RENAME CONSTRAINT "BonoTemplate_pkey" TO "Bono_pkey";

-- RenameForeignKey
ALTER TABLE "Bono" RENAME CONSTRAINT "BonoTemplate_businessId_fkey" TO "Bono_businessId_fkey";

-- RenameForeignKey
ALTER TABLE "ClientBono" RENAME CONSTRAINT "ClientBono_templateId_fkey" TO "ClientBono_bonoId_fkey";

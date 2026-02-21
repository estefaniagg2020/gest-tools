ALTER TABLE "Bono"
ADD COLUMN "serviceCategoryId" TEXT;

ALTER TABLE "Bono"
ADD CONSTRAINT "Bono_serviceCategoryId_fkey"
FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Bono_serviceCategoryId_idx" ON "Bono"("serviceCategoryId");

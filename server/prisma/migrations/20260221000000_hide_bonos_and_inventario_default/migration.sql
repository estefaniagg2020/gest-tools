-- Hide Bonos and Inventory by default (can be re-enabled in Config > Modules)
UPDATE "GestorConfig" SET "bonosEnabled" = false, "inventarioEnabled" = false;

ALTER TABLE "GestorConfig" ALTER COLUMN "bonosEnabled" SET DEFAULT false;
ALTER TABLE "GestorConfig" ALTER COLUMN "inventarioEnabled" SET DEFAULT false;

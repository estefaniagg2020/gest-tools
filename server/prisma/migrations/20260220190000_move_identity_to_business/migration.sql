-- Move business identity fields from GestorConfig to Business
-- Step 1: Add new columns to Business
ALTER TABLE "Business"
  ADD COLUMN "logoUrl"            TEXT,
  ADD COLUMN "email"              TEXT,
  ADD COLUMN "phone"              TEXT,
  ADD COLUMN "address"            TEXT,
  ADD COLUMN "professionId"       TEXT,
  ADD COLUMN "taxId"              TEXT,
  ADD COLUMN "businessAddress"    TEXT,
  ADD COLUMN "businessPopulation" TEXT,
  ADD COLUMN "isCanarias"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "description"        TEXT,
  ADD COLUMN "publicPhoneNumber"  TEXT,
  ADD COLUMN "slug"               TEXT,
  ADD COLUMN "socialLinks"        JSONB;

-- Step 2: Copy data from GestorConfig → Business
UPDATE "Business" b
SET
  "logoUrl"            = gc."logoUrl",
  "email"              = gc."email",
  "phone"              = gc."phone",
  "address"            = gc."address",
  "professionId"       = gc."professionId",
  "taxId"              = gc."taxId",
  "businessAddress"    = gc."businessAddress",
  "businessPopulation" = gc."businessPopulation",
  "isCanarias"         = gc."isCanarias",
  "description"        = gc."description",
  "publicPhoneNumber"  = gc."publicPhoneNumber",
  "slug"               = gc."slug",
  "socialLinks"        = gc."socialLinks"
FROM "GestorConfig" gc
WHERE gc."businessId" = b."id";

-- Step 3: Add unique constraint on slug for Business
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- Step 4: Drop FK constraint for professionId on GestorConfig (if exists)
ALTER TABLE "GestorConfig" DROP CONSTRAINT IF EXISTS "GestorConfig_professionId_fkey";

-- Step 5: Drop unique constraint on slug from GestorConfig (if exists)
DROP INDEX IF EXISTS "GestorConfig_slug_key";

-- Step 6: Drop identity columns from GestorConfig
ALTER TABLE "GestorConfig"
  DROP COLUMN IF EXISTS "logoUrl",
  DROP COLUMN IF EXISTS "email",
  DROP COLUMN IF EXISTS "phone",
  DROP COLUMN IF EXISTS "address",
  DROP COLUMN IF EXISTS "professionId",
  DROP COLUMN IF EXISTS "taxId",
  DROP COLUMN IF EXISTS "businessAddress",
  DROP COLUMN IF EXISTS "businessPopulation",
  DROP COLUMN IF EXISTS "isCanarias",
  DROP COLUMN IF EXISTS "description",
  DROP COLUMN IF EXISTS "publicPhoneNumber",
  DROP COLUMN IF EXISTS "slug",
  DROP COLUMN IF EXISTS "socialLinks";

-- Step 7: Drop dead themeColor from Business (if exists)
ALTER TABLE "Business" DROP COLUMN IF EXISTS "themeColor";

-- Step 8: Add FK constraint for professionId on Business
ALTER TABLE "Business"
  ADD CONSTRAINT "Business_professionId_fkey"
  FOREIGN KEY ("professionId") REFERENCES "Profession"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

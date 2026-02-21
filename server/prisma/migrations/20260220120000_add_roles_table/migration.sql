-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- Seed roles
INSERT INTO "Role" ("id", "name", "description", "updatedAt") VALUES
  (gen_random_uuid(), 'superadmin', 'Full system access across all businesses', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'admin',      'Business administrator with full business access', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'employee',   'Team member with limited access', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'client',     'End customer for online bookings', CURRENT_TIMESTAMP);

-- Add roleId column to User (nullable first for migration)
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Migrate existing User roles: gestor → admin, client → client
UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'admin')
WHERE "role" = 'gestor';

UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'client')
WHERE "role" = 'client';

-- Fallback: any user without a mapped role gets 'employee'
UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'employee')
WHERE "roleId" IS NULL;

-- Make roleId NOT NULL and add FK
ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old role column and enum from User
ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE IF EXISTS "UserRole";

-- Add roleId column to WorkspaceMember (nullable first for migration)
ALTER TABLE "WorkspaceMember" ADD COLUMN "roleId" TEXT;

-- Migrate existing WorkspaceMember roles: admin → admin, member → employee
UPDATE "WorkspaceMember"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'admin')
WHERE "role" = 'admin';

UPDATE "WorkspaceMember"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'employee')
WHERE "role" = 'member';

-- Fallback
UPDATE "WorkspaceMember"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'employee')
WHERE "roleId" IS NULL;

-- Make roleId NOT NULL and add FK
ALTER TABLE "WorkspaceMember" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old role column and enum from WorkspaceMember
ALTER TABLE "WorkspaceMember" DROP COLUMN "role";
DROP TYPE IF EXISTS "WorkspaceRole";

-- Clean up unused EmployeeRole enum
DROP TYPE IF EXISTS "EmployeeRole";

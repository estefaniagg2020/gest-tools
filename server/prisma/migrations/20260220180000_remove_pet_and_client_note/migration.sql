-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_petId_fkey";
ALTER TABLE "SlotWaitlistEntry" DROP CONSTRAINT IF EXISTS "SlotWaitlistEntry_petId_fkey";
ALTER TABLE "ClientNote" DROP CONSTRAINT IF EXISTS "ClientNote_petId_fkey";
ALTER TABLE "ClientNote" DROP CONSTRAINT IF EXISTS "ClientNote_userId_fkey";
ALTER TABLE "ClientPhoto" DROP CONSTRAINT IF EXISTS "ClientPhoto_petId_fkey";
ALTER TABLE "Pet" DROP CONSTRAINT IF EXISTS "Pet_ownerId_fkey";

-- AlterTable: remove petId columns
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "petId";
ALTER TABLE "SlotWaitlistEntry" DROP COLUMN IF EXISTS "petId";
ALTER TABLE "ClientPhoto" DROP COLUMN IF EXISTS "petId";

-- DropTable
DROP TABLE IF EXISTS "ClientNote";
DROP TABLE IF EXISTS "Pet";

-- DropEnum
DROP TYPE IF EXISTS "ClientNoteType";

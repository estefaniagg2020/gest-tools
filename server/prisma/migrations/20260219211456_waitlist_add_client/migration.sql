-- DropForeignKey
ALTER TABLE "SlotWaitlistEntry" DROP CONSTRAINT "SlotWaitlistEntry_userId_fkey";

-- AlterTable
ALTER TABLE "SlotWaitlistEntry" ADD COLUMN     "clientId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SlotWaitlistEntry" ADD CONSTRAINT "SlotWaitlistEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotWaitlistEntry" ADD CONSTRAINT "SlotWaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

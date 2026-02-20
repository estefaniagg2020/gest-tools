-- AlterEnum
ALTER TYPE "BonoType" ADD VALUE 'loyalty';

-- AlterTable
ALTER TABLE "BonoTemplate" ADD COLUMN     "loyaltyRewardSessions" INTEGER,
ADD COLUMN     "loyaltyTriggerEvery" INTEGER;

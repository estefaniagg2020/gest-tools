-- Fix FK: Service.categoryId should CASCADE on delete (ServiceCategory → Service)
-- Previously RESTRICT, preventing deletion of ServiceCategory rows that have Services.
ALTER TABLE "Service" DROP CONSTRAINT "Service_categoryId_fkey";
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix FK: SlotWaitlistEntry.serviceId should CASCADE on delete (Service → SlotWaitlistEntry)
-- Previously RESTRICT, preventing deletion of Service rows that have waitlist entries.
ALTER TABLE "SlotWaitlistEntry" DROP CONSTRAINT "SlotWaitlistEntry_serviceId_fkey";
ALTER TABLE "SlotWaitlistEntry" ADD CONSTRAINT "SlotWaitlistEntry_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

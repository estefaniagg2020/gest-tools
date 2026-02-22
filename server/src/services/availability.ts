import type { PrismaClient, Appointment } from "../generated/prisma/index.js";

const MS_MINUTE = 60 * 1000;

const buildSlotsForDay = (
  date: Date,
  startHour: number,
  endHour: number,
  slotStepMinutes: number,
  serviceDurationMinutes: number,
): { start: Date; end: Date }[] => {
  const slots: { start: Date; end: Date }[] = [];
  const start = new Date(date);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);
  const slotEnd = new Date(start);
  slotEnd.setMinutes(slotEnd.getMinutes() + serviceDurationMinutes);
  while (slotEnd <= end) {
    slots.push({ start: new Date(start), end: new Date(slotEnd) });
    start.setMinutes(start.getMinutes() + slotStepMinutes);
    slotEnd.setTime(start.getTime());
    slotEnd.setMinutes(slotEnd.getMinutes() + serviceDurationMinutes);
  }
  return slots;
};

const isSlotAvailable = (
  slot: { start: Date; end: Date },
  appointments: Appointment[],
): boolean => {
  const slotStart = slot.start.getTime();
  const slotEnd = slot.end.getTime();
  const hasOverlap = appointments.some((apt: Appointment) => {
    const aptStart = new Date(apt.start).getTime();
    const aptEnd = new Date(apt.end).getTime();
    return slotStart < aptEnd && aptStart < slotEnd;
  });
  return !hasOverlap;
};

const isGapSlot = (
  slot: { start: Date; end: Date },
  appointments: Appointment[],
): boolean => {
  const slotStart = slot.start.getTime();
  const slotEnd = slot.end.getTime();
  const tolerance = MS_MINUTE;
  const hasAppointmentEndingJustBefore = appointments.some((apt: Appointment) => {
    const aptEnd = new Date(apt.end).getTime();
    return Math.abs(aptEnd - slotStart) < tolerance;
  });
  const hasAppointmentStartingJustAfter = appointments.some((apt: Appointment) => {
    const aptStart = new Date(apt.start).getTime();
    return Math.abs(aptStart - slotEnd) < tolerance;
  });
  return hasAppointmentEndingJustBefore && hasAppointmentStartingJustAfter;
};

export const getAvailableSlots = async (
  prisma: PrismaClient,
  businessId: string,
  dateStr: string,
  serviceId: string,
): Promise<{ start: string; end: string }[]> => {
  const date = new Date(dateStr + "T12:00:00.000Z");
  const config = await prisma.gestorConfig.findUnique({
    where: { businessId },
  });
  const service = await prisma.businessService.findFirst({
    where: { id: serviceId, businessId },
  });
  if (!config || !service) return [];
  const allSlots = buildSlotsForDay(
    date,
    config.startHour,
    config.endHour,
    config.slotDurationMinutes,
    service.duration,
  );
  const appointments = await prisma.appointment.findMany({
    where: { businessId, status: "confirmed" },
  });
  const available = allSlots.filter((slot) =>
    isSlotAvailable(slot, appointments),
  );
  return available.map((s) => ({
    start: s.start.toISOString(),
    end: s.end.toISOString(),
  }));
};

export type SmartSlot = { start: string; end: string; discountPercent: number };

export const getSmartSlots = async (
  prisma: PrismaClient,
  businessId: string,
  dateStr: string,
  serviceId: string,
): Promise<SmartSlot[]> => {
  const date = new Date(dateStr + "T12:00:00.000Z");
  const config = await prisma.gestorConfig.findUnique({
    where: { businessId },
  });
  const service = await prisma.businessService.findFirst({
    where: { id: serviceId, businessId },
  });
  if (!config || !service) return [];
  const appointments = await prisma.appointment.findMany({
    where: { businessId, status: "confirmed" },
  });
  const allSlots = buildSlotsForDay(
    date,
    config.startHour,
    config.endHour,
    config.slotDurationMinutes,
    service.duration,
  );
  const available = allSlots.filter((slot) =>
    isSlotAvailable(slot, appointments),
  );
  const discountPercent =
    config.smartFillingEnabled && config.smartFillingDiscountPercent != null
      ? config.smartFillingDiscountPercent
      : 0;
  return available.map((s) => ({
    start: s.start.toISOString(),
    end: s.end.toISOString(),
    discountPercent: discountPercent > 0 && isGapSlot(s, appointments)
      ? discountPercent
      : 0,
  }));
};

export const getOccupiedSlots = async (
  prisma: PrismaClient,
  businessId: string,
  dateStr: string,
  serviceId: string,
): Promise<{ start: string; end: string }[]> => {
  const date = new Date(dateStr + "T12:00:00.000Z");
  const config = await prisma.gestorConfig.findUnique({
    where: { businessId },
  });
  const service = await prisma.businessService.findFirst({
    where: { id: serviceId, businessId },
  });
  if (!config || !service) return [];
  const allSlots = buildSlotsForDay(
    date,
    config.startHour,
    config.endHour,
    config.slotDurationMinutes,
    service.duration,
  );
  const appointments = await prisma.appointment.findMany({
    where: { businessId, status: "confirmed" },
  });
  const occupied = allSlots.filter((slot) => !isSlotAvailable(slot, appointments));
  return occupied.map((s) => ({
    start: s.start.toISOString(),
    end: s.end.toISOString(),
  }));
};

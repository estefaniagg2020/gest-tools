import type { PrismaClient } from "@prisma/client";

const MS_MINUTE = 60 * 1000;

const slotMatches = (
  slotStart: Date,
  slotEnd: Date,
  preferredStart: Date,
  preferredEnd: Date,
): boolean => {
  const tolerance = MS_MINUTE;
  return (
    Math.abs(slotStart.getTime() - preferredStart.getTime()) < tolerance &&
    Math.abs(slotEnd.getTime() - preferredEnd.getTime()) < tolerance
  );
};

export const addToWaitlist = async (
  prisma: PrismaClient,
  userId: string,
  businessId: string,
  serviceId: string,
  preferredStart: string,
  preferredEnd: string,
) => {
  const startDate = new Date(preferredStart);
  const endDate = new Date(preferredEnd);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Fechas inválidas");
  }
  const existing = await prisma.slotWaitlistEntry.findFirst({
    where: {
      userId,
      businessId,
      serviceId,
      preferredStart: startDate,
      preferredEnd: endDate,
    },
  });
  if (existing) return existing;
  return prisma.slotWaitlistEntry.create({
    data: {
      userId,
      businessId,
      serviceId,
      preferredStart: startDate,
      preferredEnd: endDate,
    },
    include: {
      business: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
};

export const getMyWaitlist = async (
  prisma: PrismaClient,
  userId: string,
) => {
  return prisma.slotWaitlistEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      business: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
};

export const getMyNotifications = async (
  prisma: PrismaClient,
  userId: string,
) => {
  return prisma.waitlistNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markNotificationRead = async (
  prisma: PrismaClient,
  notificationId: string,
  userId: string,
) => {
  return prisma.waitlistNotification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
};

export const notifyWaitlistForFreedSlot = async (
  prisma: PrismaClient,
  businessId: string,
  serviceId: string,
  slotStart: Date,
  slotEnd: Date,
) => {
  const entries = await prisma.slotWaitlistEntry.findMany({
    where: { businessId, serviceId },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });
  const matching = entries.filter((e) =>
    slotMatches(slotStart, slotEnd, e.preferredStart, e.preferredEnd),
  );
  const created = [];
  for (const entry of matching) {
    const notif = await prisma.waitlistNotification.create({
      data: {
        userId: entry.userId,
        businessId,
        serviceId,
        slotStart,
        slotEnd,
      },
    });
    created.push(notif);
  }
  return created;
};

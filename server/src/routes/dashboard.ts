import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const CANCELLED_STATUS = "cancelled";

const startOfTodayUTC = (): Date => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const endOfTodayUTC = (): Date => {
  const start = startOfTodayUTC();
  start.setUTCDate(start.getUTCDate() + 1);
  return new Date(start.getTime() - 1);
};

const startOfWeekUTC = (): Date => {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const endOfWeekUTC = (): Date => {
  const start = startOfWeekUTC();
  start.setUTCDate(start.getUTCDate() + 7);
  return new Date(start.getTime() - 1);
};

const startOfMonthUTC = (): Date => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
};

const endOfMonthUTC = (): Date => {
  const start = startOfMonthUTC();
  start.setUTCMonth(start.getUTCMonth() + 1);
  return new Date(start.getTime() - 1);
};

export const dashboardRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/stats", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }

    const businessId = req.user.businessId;
    const monthStart = startOfMonthUTC();
    const monthEnd = endOfMonthUTC();
    const weekStart = startOfWeekUTC();
    const weekEnd = endOfWeekUTC();
    const todayStart = startOfTodayUTC();
    const todayEnd = endOfTodayUTC();
    const now = new Date();

    try {
      const [
        reservasMes,
        reservasSemana,
        appointmentsToday,
        reservasCanceladas,
        totalReservasMes,
        appointmentsForPerson,
        appointmentsMonth,
        appointmentsWeekForHours,
        clientesNuevos,
        proximasCitasHoy,
        waitlistEntries,
      ] = await Promise.all([
        prisma.appointment.count({
          where: {
            businessId,
            start: { gte: monthStart, lte: monthEnd },
            status: { not: CANCELLED_STATUS },
          },
        }),
        prisma.appointment.count({
          where: {
            businessId,
            start: { gte: weekStart, lte: weekEnd },
            status: { not: CANCELLED_STATUS },
          },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: todayStart, lte: todayEnd },
            status: { not: CANCELLED_STATUS },
          },
          include: { service: { select: { price: true } } },
        }),
        prisma.appointment.count({
          where: {
            businessId,
            start: { gte: monthStart, lte: monthEnd },
            status: CANCELLED_STATUS,
          },
        }),
        prisma.appointment.count({
          where: {
            businessId,
            start: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: monthStart, lte: monthEnd },
            status: { not: CANCELLED_STATUS },
          },
          select: { workspaceMemberId: true },
        }) as any as { workspaceMemberId: string | null }[],
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: monthStart, lte: monthEnd },
            status: { not: CANCELLED_STATUS },
          },
          select: { serviceId: true, workspaceMemberId: true, service: { select: { name: true, price: true } } },
        }) as any as { serviceId: string, workspaceMemberId: string | null, service: { name: string, price: number } | null }[],
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: weekStart, lte: weekEnd },
            status: { not: CANCELLED_STATUS },
          },
          select: { start: true, end: true },
        }),
        prisma.client.count({
          where: {
            businessId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: now, lte: todayEnd },
            status: { not: CANCELLED_STATUS },
          },
          include: {
            service: { select: { name: true } },
          },
          orderBy: { start: "asc" },
          take: 5,
        }),
        prisma.slotWaitlistEntry.findMany({
          where: { businessId },
          include: {
            user: { select: { name: true, username: true } },
            client: { select: { name: true } },
            service: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
          take: 8,
        }),
      ]);

      const beneficioHoy = appointmentsToday.reduce(
        (sum, a) => sum + (a.service?.price ?? 0),
        0,
      );

      const ingresosMes = appointmentsMonth.reduce(
        (sum, a) => sum + (a.service?.price ?? 0),
        0,
      );

      const tasaCancelacion = totalReservasMes > 0
        ? Math.round((reservasCanceladas / totalReservasMes) * 100)
        : 0;

      const countByMemberId = new Map<string, number>();
      for (const a of appointmentsForPerson) {
        const key = a.workspaceMemberId ?? "__sin_asignar__";
        countByMemberId.set(key, (countByMemberId.get(key) ?? 0) + 1);
      }

      const memberIds = [...countByMemberId.keys()].filter((id) => id !== "__sin_asignar__");
      const members =
        memberIds.length > 0
          ? await prisma.workspaceMember.findMany({
              where: { id: { in: memberIds }, businessId },
              select: { id: true, name: true },
            })
          : [];
      const memberNames = new Map(members.map((m) => [m.id, m.name]));

      const reservasPorPersona = [...countByMemberId.entries()].map(([memberId, count]) => ({
        employeeId: memberId === "__sin_asignar__" ? null : memberId,
        employeeName: memberId === "__sin_asignar__" ? "Sin asignar" : memberNames.get(memberId) ?? null,
        count,
      }));

      const empleadoMasReservas = reservasPorPersona.length > 0
        ? reservasPorPersona.reduce((a, b) => (a.count >= b.count ? a : b))
        : null;

      const ventasByMemberId = new Map<string, number>();
      for (const a of appointmentsMonth) {
        const key = a.workspaceMemberId ?? "__sin_asignar__";
        const price = a.service?.price ?? 0;
        ventasByMemberId.set(key, (ventasByMemberId.get(key) ?? 0) + price);
      }
      const ventasPorEmpleado = [...ventasByMemberId.entries()]
        .map(([memberId, amount]) => ({
          employeeId: memberId === "__sin_asignar__" ? null : memberId,
          employeeName: memberId === "__sin_asignar__" ? "Sin asignar" : memberNames.get(memberId) ?? null,
          amount: Math.round(amount * 100) / 100,
        }))
        .sort((a, b) => b.amount - a.amount);

      const serviceCount = new Map<string, { name: string; count: number }>();
      for (const a of appointmentsMonth) {
        const entry = serviceCount.get(a.serviceId) ?? { name: a.service?.name ?? "", count: 0 };
        entry.count += 1;
        serviceCount.set(a.serviceId, entry);
      }
      const serviciosPopulares = [...serviceCount.entries()]
        .map(([serviceId, { name, count }]) => ({ serviceId, serviceName: name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const horasTrabajadasSemana = appointmentsWeekForHours.reduce((sum, a) => {
        const ms = new Date(a.end).getTime() - new Date(a.start).getTime();
        return sum + ms / (1000 * 60 * 60);
      }, 0);

      const nextMemberIds = proximasCitasHoy
        .map((a: any) => a.workspaceMemberId)
        .filter((id: string | null): id is string => id !== null);
      const nextMembers = nextMemberIds.length > 0
        ? await prisma.workspaceMember.findMany({
            where: { id: { in: nextMemberIds }, businessId },
            select: { id: true, name: true },
          })
        : [];
      const nextMemberNames = new Map(nextMembers.map((m) => [m.id, m.name]));

      const config = await prisma.gestorConfig.findUnique({
        where: { businessId },
        select: { startHour: true, endHour: true, workDaysPerWeek: true, maxPeoplePerSlot: true },
      });
      const slotsPerDay = config
        ? (config.endHour - config.startHour)
        : 11;
      const totalSlotsWeek = slotsPerDay * (config?.workDaysPerWeek ?? 5) * (config?.maxPeoplePerSlot ?? 1);
      const ocupacionSemanal = totalSlotsWeek > 0
        ? Math.min(100, Math.round((reservasSemana / totalSlotsWeek) * 100))
        : 0;

      res.json({
        reservasMes,
        reservasSemana,
        beneficioHoy,
        ingresosMes: Math.round(ingresosMes * 100) / 100,
        reservasCanceladas,
        tasaCancelacion,
        reservasPorPersona,
        empleadoMasReservas,
        ventasPorEmpleado,
        serviciosPopulares,
        clientesNuevos,
        proximasCitasHoy: proximasCitasHoy.map((a) => ({
          id: a.id,
          serviceName: a.service?.name ?? "",
          employeeName: a.workspaceMemberId ? nextMemberNames.get(a.workspaceMemberId) ?? null : null,
          start: a.start.toISOString(),
        })),
        ocupacionSemanal,
        horasTrabajadasSemana: Math.round(horasTrabajadasSemana * 10) / 10,
        productosBajoStock: [],
        listaEspera: waitlistEntries.map((e) => ({
          id: e.id,
          clientName: e.user ? (e.user.name ?? e.user.username) : (e.client?.name ?? "Cliente"),
          serviceName: e.service.name,
          preferredStart: e.preferredStart.toISOString(),
          createdAt: e.createdAt.toISOString(),
        })),
      });
    } catch (err) {
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  return router;
};

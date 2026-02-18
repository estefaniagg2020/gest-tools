import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireGestor } from "../middleware/auth.js";

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

  router.get("/stats", auth, requireGestor, async (req: Request, res: Response) => {
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
          select: { employeeId: true },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: monthStart, lte: monthEnd },
            status: { not: CANCELLED_STATUS },
          },
          select: { serviceId: true, employeeId: true, service: { select: { name: true, price: true } } },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            start: { gte: weekStart, lte: weekEnd },
            status: { not: CANCELLED_STATUS },
          },
          select: { start: true, end: true },
        }),
        prisma.user.count({
          where: {
            businessId,
            role: "client",
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

      const countByEmployeeId = new Map<string, number>();
      for (const a of appointmentsForPerson) {
        const key = a.employeeId ?? "__sin_asignar__";
        countByEmployeeId.set(key, (countByEmployeeId.get(key) ?? 0) + 1);
      }

      const employeeIds = [...countByEmployeeId.keys()].filter((id) => id !== "__sin_asignar__");
      const employees =
        employeeIds.length > 0
          ? await prisma.employee.findMany({
              where: { id: { in: employeeIds }, businessId },
              select: { id: true, name: true },
            })
          : [];
      const employeeNames = new Map(employees.map((e) => [e.id, e.name]));

      const reservasPorPersona = [...countByEmployeeId.entries()].map(([employeeId, count]) => ({
        employeeId: employeeId === "__sin_asignar__" ? null : employeeId,
        employeeName: employeeId === "__sin_asignar__" ? "Sin asignar" : employeeNames.get(employeeId) ?? null,
        count,
      }));

      const empleadoMasReservas = reservasPorPersona.length > 0
        ? reservasPorPersona.reduce((a, b) => (a.count >= b.count ? a : b))
        : null;

      const ventasByEmployeeId = new Map<string, number>();
      for (const a of appointmentsMonth) {
        const key = a.employeeId ?? "__sin_asignar__";
        const price = a.service?.price ?? 0;
        ventasByEmployeeId.set(key, (ventasByEmployeeId.get(key) ?? 0) + price);
      }
      const ventasPorEmpleado = [...ventasByEmployeeId.entries()]
        .map(([employeeId, amount]) => ({
          employeeId: employeeId === "__sin_asignar__" ? null : employeeId,
          employeeName: employeeId === "__sin_asignar__" ? "Sin asignar" : employeeNames.get(employeeId) ?? null,
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

      const nextEmployeeIds = proximasCitasHoy
        .map((a) => a.employeeId)
        .filter((id): id is string => id !== null);
      const nextEmployees = nextEmployeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: nextEmployeeIds }, businessId },
            select: { id: true, name: true },
          })
        : [];
      const nextEmpNames = new Map(nextEmployees.map((e) => [e.id, e.name]));

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
          employeeName: a.employeeId ? nextEmpNames.get(a.employeeId) ?? null : null,
          start: a.start.toISOString(),
        })),
        ocupacionSemanal,
        horasTrabajadasSemana: Math.round(horasTrabajadasSemana * 10) / 10,
        productosBajoStock: [],
      });
    } catch (err) {
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  return router;
};

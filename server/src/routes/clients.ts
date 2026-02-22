import { Router, Request, Response } from "express";
import type { PrismaClient, AppointmentStatus, PaymentStatus } from "@prisma/client";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const CANCELLED = "cancelled" as AppointmentStatus;
const NO_SHOW = "no_show" as AppointmentStatus;
const COMPLETED = "completed" as AppointmentStatus;
const EXCLUDED_STATUSES: AppointmentStatus[] = [CANCELLED, NO_SHOW];
const UNPAID_STATUSES: PaymentStatus[] = ["pending", "partial"];

const normalize = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const tokenize = (query: string): string[] =>
  normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);

type SpecialFilter = "debt" | "no_show" | null;

const DEBT_PATTERNS = [
  "deuda", "deben", "debe", "impagado", "impagados",
  "moroso", "morosos", "sin pagar", "pendiente pago",
  "unpaid", "debt", "owe", "owes",
];

const NO_SHOW_PATTERNS = [
  "no acude", "no acuden", "no vino", "no viene",
  "no show", "noshow", "ausencia", "ausencias",
  "faltan", "falta", "plantaron", "planton",
];

const detectSpecialFilter = (normalizedQuery: string): SpecialFilter => {
  if (DEBT_PATTERNS.some((p) => normalizedQuery.includes(p))) return "debt";
  if (NO_SHOW_PATTERNS.some((p) => normalizedQuery.includes(p))) return "no_show";
  return null;
};

export const clientsRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  const getBizId = (req: Request): string => req.user?.businessId ?? "";

  router.get("/search", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }

    const rawQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!rawQuery) { res.json({ results: [], query: "", specialFilter: null }); return; }

    const normalizedQuery = normalize(rawQuery);
    const specialFilter = detectSpecialFilter(normalizedQuery);
    const tokens = tokenize(rawQuery);

    if (tokens.length === 0 && !specialFilter) {
      res.json({ results: [], query: rawQuery, specialFilter: null });
      return;
    }

    try {
      const services = await prisma.businessService.findMany({
        where: { businessId },
        select: { id: true, name: true, price: true },
      });

      const normalizedServices = services.map((s) => ({
        ...s,
        normalized: normalize(s.name),
      }));
      const servicePriceById = new Map(normalizedServices.map((s) => [s.id, Number(s.price)]));
      const serviceNameById = new Map(normalizedServices.map((s) => [s.id, s.name]));

      const serviceTokens: string[] = [];
      const clientTokens: string[] = [];

      if (!specialFilter) {
        for (const token of tokens) {
          const matchesService = normalizedServices.some((s) =>
            s.normalized.includes(token),
          );
          if (matchesService) serviceTokens.push(token);
          clientTokens.push(token);
        }
      }

      const matchedServiceIds = serviceTokens.length > 0
        ? normalizedServices
            .filter((s) => serviceTokens.some((t) => s.normalized.includes(t)))
            .map((s) => s.id)
        : [];

      let clients: Awaited<ReturnType<typeof prisma.client.findMany>> = [];

      if (specialFilter === "debt") {
        clients = await prisma.client.findMany({
          where: {
            businessId,
            appointments: {
              some: {
                status: COMPLETED,
                paymentStatus: { in: UNPAID_STATUSES },
              },
            },
          },
          take: 30,
          orderBy: { name: "asc" },
        });
      } else if (specialFilter === "no_show") {
        clients = await prisma.client.findMany({
          where: {
            businessId,
            appointments: { some: { status: NO_SHOW } },
          },
          take: 30,
          orderBy: { name: "asc" },
        });
      } else {
        clients = await prisma.client.findMany({
          where: {
            businessId,
            AND: clientTokens.map((token) => ({
              name: { contains: token, mode: "insensitive" as const },
            })),
          },
          take: 20,
          orderBy: { name: "asc" },
        });

        if (clients.length === 0 && serviceTokens.length > 0) {
          const clientsByService = await prisma.client.findMany({
            where: {
              businessId,
              appointments: {
                some: {
                  serviceId: { in: matchedServiceIds },
                  status: { notIn: EXCLUDED_STATUSES },
                },
              },
            },
            take: 20,
            orderBy: { name: "asc" },
          });
          clients.push(...clientsByService);
        }
      }

      if (clients.length === 0) {
        res.json({ results: [], query: rawQuery, specialFilter });
        return;
      }

      const clientIds = clients.map((c) => c.id);

      const [allAppointments, unpaidAppointments, noShowAppointments, workspaceMembers] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            businessId,
            clientId: { in: clientIds },
            status: { notIn: EXCLUDED_STATUSES },
          },
          select: {
            clientId: true,
            serviceId: true,
            start: true,
            workspaceMemberId: true,
          },
          orderBy: { start: "desc" },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            clientId: { in: clientIds },
            status: COMPLETED,
            paymentStatus: { in: UNPAID_STATUSES },
          },
          select: {
            clientId: true,
            serviceId: true,
          },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            clientId: { in: clientIds },
            status: NO_SHOW,
          },
          select: { clientId: true },
        }),
        prisma.workspaceMember.findMany({
          where: { businessId },
          select: { id: true, name: true },
        }),
      ]);
      const workspaceMemberNameById = new Map(workspaceMembers.map((member) => [member.id, member.name]));

      const appointmentsByClient = new Map<string, typeof allAppointments>();
      for (const apt of allAppointments) {
        if (!apt.clientId) continue;
        const list = appointmentsByClient.get(apt.clientId) ?? [];
        list.push(apt);
        appointmentsByClient.set(apt.clientId, list);
      }

      const debtByClient = new Map<string, number>();
      for (const apt of unpaidAppointments) {
        if (!apt.clientId) continue;
        const servicePrice = apt.serviceId ? (servicePriceById.get(apt.serviceId) ?? 0) : 0;
        debtByClient.set(
          apt.clientId,
          (debtByClient.get(apt.clientId) ?? 0) + servicePrice,
        );
      }

      const noShowByClient = new Map<string, number>();
      for (const apt of noShowAppointments) {
        if (!apt.clientId) continue;
        noShowByClient.set(apt.clientId, (noShowByClient.get(apt.clientId) ?? 0) + 1);
      }

      const results = clients.map((client) => {
        const apts = appointmentsByClient.get(client.id) ?? [];
        const lastApt = apts[0] ?? null;

        const serviceCountMap = new Map<string, { name: string; count: number; lastDate: string }>();
        for (const a of apts) {
          if (!a.serviceId) continue;
          const serviceName = serviceNameById.get(a.serviceId);
          if (!serviceName) continue;
          const existing = serviceCountMap.get(a.serviceId);
          if (existing) {
            existing.count += 1;
          } else {
            serviceCountMap.set(a.serviceId, {
              name: serviceName,
              count: 1,
              lastDate: a.start.toISOString(),
            });
          }
        }

        const topServices = [...serviceCountMap.values()]
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        let matchedServiceHistory = null;
        if (matchedServiceIds.length > 0) {
          for (const sId of matchedServiceIds) {
            const entry = serviceCountMap.get(sId);
            if (entry) {
              matchedServiceHistory = {
                serviceId: sId,
                serviceName: entry.name,
                lastDate: entry.lastDate,
                totalTimes: entry.count,
              };
              break;
            }
          }
        }

        const pendingAmount = Math.round((debtByClient.get(client.id) ?? 0) * 100) / 100;
        const noShowCount = noShowByClient.get(client.id) ?? 0;
        const totalWithNoShows = apts.length + noShowCount;
        const noShowRate = totalWithNoShows > 0
          ? Math.round((noShowCount / totalWithNoShows) * 100)
          : 0;

        return {
          client,
          lastVisit: lastApt?.start?.toISOString() ?? null,
          lastVisitServiceName: lastApt?.serviceId
            ? (serviceNameById.get(lastApt.serviceId) ?? null)
            : null,
          lastVisitMemberName: lastApt?.workspaceMemberId
            ? (workspaceMemberNameById.get(lastApt.workspaceMemberId) ?? null)
            : null,
          totalVisits: apts.length,
          topServices,
          matchedServiceHistory,
          pendingAmount,
          noShowCount,
          noShowRate,
        };
      });

      results.sort((a, b) => {
        if (specialFilter === "debt") return b.pendingAmount - a.pendingAmount;
        if (specialFilter === "no_show") return b.noShowCount - a.noShowCount;
        if (a.matchedServiceHistory && !b.matchedServiceHistory) return -1;
        if (!a.matchedServiceHistory && b.matchedServiceHistory) return 1;
        if (a.lastVisit && b.lastVisit) return b.lastVisit.localeCompare(a.lastVisit);
        if (a.lastVisit) return -1;
        if (b.lastVisit) return 1;
        return 0;
      });

      res.json({
        results,
        query: rawQuery,
        specialFilter,
        serviceHint: serviceTokens.length > 0
          ? normalizedServices
              .filter((s) => serviceTokens.some((t) => s.normalized.includes(t)))
              .map((s) => s.name)
          : [],
      });
    } catch (error) {
      console.error("[clients/search]", error);
      res.status(500).json({ error: "Error en la búsqueda" });
    }
  });

  router.get("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const clients = await prisma.client.findMany({
        where: { businessId },
        orderBy: { name: "asc" },
      });
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  router.post("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) { res.status(400).json({ error: "name es requerido" }); return; }
    try {
      const client = await prisma.client.create({
        data: {
          businessId,
          name,
          email: body.email ?? null,
          phone: body.phone ?? null,
          notes: body.notes ?? null,
        },
      });
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  router.put("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.client.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Cliente no encontrado" }); return;
      }
      const body = req.body ?? {};
      const updated = await prisma.client.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: String(body.name).trim() }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  router.delete("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.client.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Cliente no encontrado" }); return;
      }
      await prisma.client.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  return router;
};

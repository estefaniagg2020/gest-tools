import { Router, Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireStaff } from "../middleware/auth.js";

export const bonosRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  const getBizId = (req: Request): string => req.user?.businessId ?? "";

  // --- Bono CRUD (empresa tiene muchos bonos) ---

  router.get("/templates", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const list = await prisma.bono.findMany({ where: { businessId }, orderBy: { name: "asc" } });
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonos" });
    }
  });

  const mapFrontendTypeToEnum = (t: string): "session_pack" | "time_pack" | "unlimited" | "loyalty" => {
    if (t === "loyalty") return "loyalty";
    if (t === "pack") return "session_pack";
    if (["session_pack", "time_pack", "unlimited"].includes(t)) return t as "session_pack" | "time_pack" | "unlimited";
    return "session_pack";
  };

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string")
      return (err as { message: string }).message;
    return String(err);
  };

  const resolveServiceIdForBusiness = async (
    serviceId: string,
    businessId: string,
  ): Promise<string | null> => {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { businessId: true },
    });
    if (service && service.businessId === businessId) return serviceId;

    const professionSvc = await prisma.professionService.findUnique({
      where: { id: serviceId },
      include: { category: true },
    });
    if (!professionSvc) return null;

    const existing = await prisma.service.findFirst({
      where: { businessId, sourceServiceId: serviceId },
      select: { id: true },
    });
    if (existing) return existing.id;

    const serviceCategory = await prisma.serviceCategory.findFirst({
      where: { businessId, label: professionSvc.category.label },
      select: { id: true },
    });
    const categoryId = serviceCategory?.id ?? (
      await prisma.serviceCategory.create({
        data: {
          businessId,
          label: professionSvc.category.label,
          icon: professionSvc.category.icon,
        },
        select: { id: true },
      })
    ).id;

    const created = await prisma.service.create({
      data: {
        businessId,
        categoryId,
        name: professionSvc.name,
        duration: professionSvc.duration,
        price: professionSvc.price,
        description: professionSvc.description ?? null,
        sourceServiceId: serviceId,
      },
      select: { id: true },
    });
    return created.id;
  };

  router.post("/templates", auth, requireStaff, async (req: Request, res: Response, next: NextFunction) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    console.log("[bonos] POST /templates", { businessId, body: JSON.stringify(body) });
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const typeRaw = typeof body.type === "string" ? body.type.trim() : "";
    const serviceId = typeof body.serviceId === "string" && body.serviceId.trim()
      ? body.serviceId.trim()
      : null;
    const serviceCategoryId = typeof body.serviceCategoryId === "string" && body.serviceCategoryId.trim()
      ? body.serviceCategoryId.trim()
      : null;
    if (!name || !typeRaw) { res.status(400).json({ error: "name y type son requeridos" }); return; }
    if (serviceId && serviceCategoryId) {
      res.status(400).json({ error: "Solo puedes asignar servicio o categoría, no ambos" });
      return;
    }
    const type = mapFrontendTypeToEnum(typeRaw);
    try {
      const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
      if (!business) {
        res.status(400).json({ error: "El negocio no existe. Cierra sesión y vuelve a entrar." });
        return;
      }
      let resolvedServiceId: string | null = null;
      if (serviceId) {
        resolvedServiceId = await resolveServiceIdForBusiness(serviceId, businessId);
        if (!resolvedServiceId) {
          res.status(404).json({ error: "Servicio no encontrado para este negocio" });
          return;
        }
      }
      if (serviceCategoryId) {
        const category = await prisma.serviceCategory.findUnique({
          where: { id: serviceCategoryId },
          select: { businessId: true },
        });
        if (!category || category.businessId !== businessId) {
          res.status(404).json({ error: "Categoría no encontrada para este negocio" });
          return;
        }
      }
      const bono = await prisma.bono.create({
        data: {
          businessId,
          name,
          type,
          sessions: body.sessions != null ? Number(body.sessions) : null,
          price: body.price != null ? Number(body.price) : null,
          validDays: body.validDays != null ? Number(body.validDays) : null,
          serviceId: resolvedServiceId,
          serviceCategoryId,
          loyaltyTriggerEvery: body.loyaltyTriggerEvery != null ? Number(body.loyaltyTriggerEvery) : null,
          loyaltyRewardSessions: body.loyaltyRewardSessions != null ? Number(body.loyaltyRewardSessions) : null,
        },
      });
      res.status(201).json(bono);
    } catch (error) {
      console.error("[bonos] POST /templates error:", error);
      const message = getErrorMessage(error) || "Error al crear la plantilla de bono";
      const err = error instanceof Error ? error : new Error(message);
      (err as Error & { statusCode?: number }).statusCode = 500;
      next(err);
    }
  });

  router.put("/templates/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.bono.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Bono no encontrado" }); return;
      }
      const body = req.body ?? {};
      const requestedServiceId = body.serviceId !== undefined
        ? (typeof body.serviceId === "string" && body.serviceId.trim() ? body.serviceId.trim() : null)
        : existing.serviceId;
      const requestedServiceCategoryId = body.serviceCategoryId !== undefined
        ? (typeof body.serviceCategoryId === "string" && body.serviceCategoryId.trim() ? body.serviceCategoryId.trim() : null)
        : existing.serviceCategoryId;
      if (requestedServiceId && requestedServiceCategoryId) {
        res.status(400).json({ error: "Solo puedes asignar servicio o categoría, no ambos" });
        return;
      }
      let resolvedRequestedServiceId: string | null = null;
      if (requestedServiceId) {
        resolvedRequestedServiceId = await resolveServiceIdForBusiness(requestedServiceId, businessId);
        if (!resolvedRequestedServiceId) {
          res.status(404).json({ error: "Servicio no encontrado para este negocio" });
          return;
        }
      }
      if (requestedServiceCategoryId) {
        const category = await prisma.serviceCategory.findUnique({
          where: { id: requestedServiceCategoryId },
          select: { businessId: true },
        });
        if (!category || category.businessId !== businessId) {
          res.status(404).json({ error: "Categoría no encontrada para este negocio" });
          return;
        }
      }
      const updateData: Record<string, unknown> = {
        ...(body.name !== undefined && { name: String(body.name).trim() }),
        ...(body.type !== undefined && { type: mapFrontendTypeToEnum(String(body.type)) }),
        ...(body.sessions !== undefined && { sessions: body.sessions }),
        ...(body.price !== undefined && { price: body.price != null ? Number(body.price) : null }),
        ...(body.validDays !== undefined && { validDays: body.validDays }),
        ...(body.serviceId !== undefined && { serviceId: resolvedRequestedServiceId }),
        ...(body.serviceCategoryId !== undefined && { serviceCategoryId: requestedServiceCategoryId }),
        ...(body.loyaltyTriggerEvery !== undefined && { loyaltyTriggerEvery: body.loyaltyTriggerEvery != null ? Number(body.loyaltyTriggerEvery) : null }),
        ...(body.loyaltyRewardSessions !== undefined && { loyaltyRewardSessions: body.loyaltyRewardSessions != null ? Number(body.loyaltyRewardSessions) : null }),
      };
      const updated = await prisma.bono.update({
        where: { id },
        data: updateData,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bono" });
    }
  });

  router.delete("/templates/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.bono.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Bono no encontrado" }); return;
      }
      await prisma.clientBono.deleteMany({ where: { bonoId: id } });
      await prisma.bono.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bono" });
    }
  });

  // --- ClientBono CRUD ---

  router.get("/client-bonos", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const bonos = await prisma.clientBono.findMany({
        where: { client: { businessId } },
        orderBy: { assignedAt: "desc" },
      });
      res.json(bonos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client bonos" });
    }
  });

  router.post("/client-bonos", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const clientId = body.clientId;
    const bonoId = body.bonoId ?? body.templateId;
    if (!clientId || !bonoId) { res.status(400).json({ error: "clientId y bonoId son requeridos" }); return; }
    try {
      const [client, bono] = await Promise.all([
        prisma.client.findUnique({ where: { id: clientId } }),
        prisma.bono.findUnique({ where: { id: bonoId } }),
      ]);
      if (!client || client.businessId !== businessId) {
        res.status(404).json({ error: "Cliente no encontrado" }); return;
      }
      if (!bono || bono.businessId !== businessId) {
        res.status(404).json({ error: "Bono no encontrado" }); return;
      }
      const clientBono = await prisma.clientBono.create({
        data: {
          clientId,
          bonoId,
          sessionsTotal: body.sessionsTotal ?? bono.sessions ?? null,
          remainingSessions: body.remainingSessions ?? bono.sessions ?? null,
          paidCount: 0,
          freeSessionsRemaining: body.freeSessionsRemaining ?? null,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        },
      });
      res.status(201).json(clientBono);
    } catch (error) {
      res.status(500).json({ error: "Failed to create client bono" });
    }
  });

  router.put("/client-bonos/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.clientBono.findUnique({ where: { id }, include: { client: { select: { businessId: true } } } });
      if (!existing || existing.client.businessId !== businessId) {
        res.status(404).json({ error: "Bono no encontrado" }); return;
      }
      const body = req.body ?? {};
      const updated = await prisma.clientBono.update({
        where: { id },
        data: {
          ...(body.sessionsUsed !== undefined && { sessionsUsed: body.sessionsUsed }),
          ...(body.sessionsTotal !== undefined && { sessionsTotal: body.sessionsTotal }),
          ...(body.remainingSessions !== undefined && { remainingSessions: body.remainingSessions }),
          ...(body.paidCount !== undefined && { paidCount: body.paidCount }),
          ...(body.freeSessionsRemaining !== undefined && { freeSessionsRemaining: body.freeSessionsRemaining }),
          ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client bono" });
    }
  });

  router.delete("/client-bonos/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.clientBono.findUnique({ where: { id }, include: { client: { select: { businessId: true } } } });
      if (!existing || existing.client.businessId !== businessId) {
        res.status(404).json({ error: "Bono no encontrado" }); return;
      }
      await prisma.clientBono.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client bono" });
    }
  });

  return router;
};

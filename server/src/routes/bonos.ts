import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireGestor } from "../middleware/auth.js";

export const bonosRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  const getBizId = (req: Request): string => req.user?.businessId ?? "";

  // --- BonoTemplate CRUD ---

  router.get("/templates", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const templates = await prisma.bonoTemplate.findMany({ where: { businessId }, orderBy: { name: "asc" } });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bono templates" });
    }
  });

  router.post("/templates", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() : "";
    if (!name || !type) { res.status(400).json({ error: "name y type son requeridos" }); return; }
    try {
      const template = await prisma.bonoTemplate.create({
        data: {
          businessId, name, type,
          sessions: body.sessions ?? null,
          price: body.price != null ? Number(body.price) : null,
          validDays: body.validDays ?? null,
          serviceId: body.serviceId ?? null,
        },
      });
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create bono template" });
    }
  });

  router.put("/templates/:id", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.bonoTemplate.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Plantilla de bono no encontrada" }); return;
      }
      const body = req.body ?? {};
      const updated = await prisma.bonoTemplate.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: String(body.name).trim() }),
          ...(body.type !== undefined && { type: body.type }),
          ...(body.sessions !== undefined && { sessions: body.sessions }),
          ...(body.price !== undefined && { price: body.price != null ? Number(body.price) : null }),
          ...(body.validDays !== undefined && { validDays: body.validDays }),
          ...(body.serviceId !== undefined && { serviceId: body.serviceId }),
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bono template" });
    }
  });

  router.delete("/templates/:id", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.bonoTemplate.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Plantilla de bono no encontrada" }); return;
      }
      await prisma.clientBono.deleteMany({ where: { templateId: id } });
      await prisma.bonoTemplate.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bono template" });
    }
  });

  // --- ClientBono CRUD ---

  router.get("/client-bonos", auth, requireGestor, async (req: Request, res: Response) => {
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

  router.post("/client-bonos", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const { clientId, templateId } = body;
    if (!clientId || !templateId) { res.status(400).json({ error: "clientId y templateId son requeridos" }); return; }
    try {
      const [client, template] = await Promise.all([
        prisma.client.findUnique({ where: { id: clientId } }),
        prisma.bonoTemplate.findUnique({ where: { id: templateId } }),
      ]);
      if (!client || client.businessId !== businessId) {
        res.status(404).json({ error: "Cliente no encontrado" }); return;
      }
      if (!template || template.businessId !== businessId) {
        res.status(404).json({ error: "Plantilla de bono no encontrada" }); return;
      }
      const bono = await prisma.clientBono.create({
        data: {
          clientId,
          templateId,
          sessionsUsed: 0,
          sessionsTotal: body.sessionsTotal ?? template.sessions ?? null,
          remainingSessions: body.remainingSessions ?? template.sessions ?? null,
          paidCount: 0,
          freeSessionsRemaining: body.freeSessionsRemaining ?? null,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        },
      });
      res.status(201).json(bono);
    } catch (error) {
      res.status(500).json({ error: "Failed to create client bono" });
    }
  });

  router.put("/client-bonos/:id", auth, requireGestor, async (req: Request, res: Response) => {
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

  router.delete("/client-bonos/:id", auth, requireGestor, async (req: Request, res: Response) => {
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

import { Router, Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/index.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

export const scheduleBlocksRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  const getBizId = (req: Request): string => req.user?.businessId ?? "";

  router.get("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const blocks = await prisma.scheduleBlock.findMany({
        where: { businessId },
        orderBy: { start: "asc" },
      });
      res.json(blocks.map((b) => ({ ...b, start: b.start.toISOString(), end: b.end.toISOString() })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule blocks" });
    }
  });

  router.post("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const { memberId, start, end, type, title } = body;
    if (!memberId || !start || !end || !type || !title) {
      res.status(400).json({ error: "memberId, start, end, type y title son requeridos" }); return;
    }
    try {
      const block = await prisma.scheduleBlock.create({
        data: {
          businessId,
          memberId,
          start: new Date(start),
          end: new Date(end),
          type,
          title,
          description: body.description ?? null,
          status: body.status ?? "active",
          serviceId: body.serviceId ?? null,
        },
      });
      res.status(201).json({ ...block, start: block.start.toISOString(), end: block.end.toISOString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to create schedule block" });
    }
  });

  router.put("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.scheduleBlock.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Bloque no encontrado" }); return;
      }
      const body = req.body ?? {};
      const updated = await prisma.scheduleBlock.update({
        where: { id },
        data: {
          ...(body.memberId !== undefined && { memberId: body.memberId }),
          ...(body.start !== undefined && { start: new Date(body.start) }),
          ...(body.end !== undefined && { end: new Date(body.end) }),
          ...(body.type !== undefined && { type: body.type }),
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.serviceId !== undefined && { serviceId: body.serviceId }),
        },
      });
      res.json({ ...updated, start: updated.start.toISOString(), end: updated.end.toISOString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to update schedule block" });
    }
  });

  router.delete("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.scheduleBlock.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Bloque no encontrado" }); return;
      }
      await prisma.scheduleBlock.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule block" });
    }
  });

  return router;
};

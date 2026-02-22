import { Router, Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/index.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

export const serviceCategoriesRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const getBizId = (req: Request): string => req.user?.businessId ?? "";

  router.get("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    if (!UUID_REGEX.test(businessId)) { res.status(400).json({ error: "businessId inválido" }); return; }
    try {
      const categories = await prisma.businessCategory.findMany({
        where: { businessId },
        orderBy: { label: "asc" },
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service categories" });
    }
  });

  router.post("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    if (!UUID_REGEX.test(businessId)) { res.status(400).json({ error: "businessId inválido" }); return; }
    const body = req.body ?? {};
    const label = typeof body.label === "string" ? body.label.trim() : "";
    if (!label) { res.status(400).json({ error: "label es requerido" }); return; }
    try {
      const category = await prisma.businessCategory.create({
        data: { businessId, label, icon: body.icon ?? null },
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service category" });
    }
  });

  router.put("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    if (!UUID_REGEX.test(businessId)) { res.status(400).json({ error: "businessId inválido" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.businessCategory.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Categoría no encontrada" }); return;
      }
      const body = req.body ?? {};
      const updated = await prisma.businessCategory.update({
        where: { id },
        data: {
          ...(body.label !== undefined && { label: String(body.label).trim() }),
          ...(body.icon !== undefined && { icon: body.icon }),
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service category" });
    }
  });

  router.delete("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    if (!UUID_REGEX.test(businessId)) { res.status(400).json({ error: "businessId inválido" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.businessCategory.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Categoría no encontrada" }); return;
      }
      await prisma.businessCategory.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service category" });
    }
  });

  return router;
};

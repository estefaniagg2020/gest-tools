import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireStaff } from "../middleware/auth.js";
import {
  addToWaitlist,
  addClientToWaitlist,
  getMyWaitlist,
  getMyNotifications,
  markNotificationRead,
  getWaitlistByBusiness,
} from "../services/waitlist.js";

export const waitlistRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/by-business", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const entries = await getWaitlistByBusiness(prisma, req.user.businessId);
    res.json(entries);
  });

  router.post("/for-client", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const { clientId, serviceId, preferredStart, preferredEnd } = req.body as {
      clientId?: string;
      serviceId?: string;
      preferredStart?: string;
      preferredEnd?: string;
    };
    if (!clientId || !serviceId || !preferredStart || !preferredEnd) {
      res.status(400).json({
        error: "clientId, serviceId, preferredStart y preferredEnd requeridos",
      });
      return;
    }
    try {
      const entry = await addClientToWaitlist(
        prisma,
        req.user.businessId,
        clientId,
        serviceId,
        preferredStart,
        preferredEnd,
      );
      res.status(201).json(entry);
    } catch (e) {
      res
        .status(400)
        .json({ error: e instanceof Error ? e.message : "Error al añadir a la lista" });
    }
  });

  router.post("/", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { businessId, serviceId, preferredStart, preferredEnd } = req.body as {
      businessId?: string;
      serviceId?: string;
      preferredStart?: string;
      preferredEnd?: string;
    };
    if (!businessId || !serviceId || !preferredStart || !preferredEnd) {
      res.status(400).json({
        error: "businessId, serviceId, preferredStart y preferredEnd requeridos",
      });
      return;
    }
    try {
      const entry = await addToWaitlist(
        prisma,
        req.user.id,
        businessId,
        serviceId,
        preferredStart,
        preferredEnd,
      );
      res.status(201).json(entry);
    } catch (e) {
      res
        .status(400)
        .json({ error: e instanceof Error ? e.message : "Error al apuntarse" });
    }
  });

  router.get("/", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const entries = await getMyWaitlist(prisma, req.user.id);
    res.json(entries);
  });

  router.get("/notifications", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const list = await getMyNotifications(prisma, req.user.id);
    res.json(list);
  });

  router.patch("/notifications/:id/read", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ error: "id requerido" });
      return;
    }
    await markNotificationRead(prisma, id, req.user.id);
    res.json({ ok: true });
  });

  return router;
};

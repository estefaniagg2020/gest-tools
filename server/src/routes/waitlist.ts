import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";
import {
  addToWaitlist,
  getMyWaitlist,
  getMyNotifications,
  markNotificationRead,
} from "../services/waitlist.js";

export const waitlistRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

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

import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  getAvailableSlots,
  getSmartSlots,
  getOccupiedSlots,
} from "../services/availability.js";

export const businessRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const businesses = await prisma.business.findMany({
        include: { gestorConfig: true, company: true },
      });
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const business = await prisma.business.create({
        data: req.body,
      });
      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business" });
    }
  });

  // Gestor Config routes
  const getId = (req: Request): string => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] ?? "" : id ?? "";
  };

  router.get("/:id/services", async (req: Request, res: Response) => {
    const businessId = getId(req);
    try {
      const services = await prisma.service.findMany({
        where: { businessId },
      });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  router.get("/:id/availability", async (req: Request, res: Response) => {
    const businessId = getId(req);
    const dateStr = req.query.date as string | undefined;
    const serviceId = req.query.serviceId as string | undefined;
    const smart = req.query.smart === "1" || req.query.smart === "true";
    if (!dateStr || !serviceId) {
      res.status(400).json({
        error: "Query params date (YYYY-MM-DD) and serviceId required",
      });
      return;
    }
    const date = new Date(dateStr + "T12:00:00.000Z");
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
    try {
      if (smart) {
        const slots = await getSmartSlots(
          prisma,
          businessId,
          dateStr,
          serviceId,
        );
        res.json({ slots });
        return;
      }
      const slots = await getAvailableSlots(
        prisma,
        businessId,
        dateStr,
        serviceId,
      );
      res.json({ slots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  router.get("/:id/occupied-slots", async (req: Request, res: Response) => {
    const businessId = getId(req);
    const dateStr = req.query.date as string | undefined;
    const serviceId = req.query.serviceId as string | undefined;
    if (!dateStr || !serviceId) {
      res.status(400).json({
        error: "Query params date (YYYY-MM-DD) and serviceId required",
      });
      return;
    }
    const date = new Date(dateStr + "T12:00:00.000Z");
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
    try {
      const slots = await getOccupiedSlots(
        prisma,
        businessId,
        dateStr,
        serviceId,
      );
      res.json({ slots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch occupied slots" });
    }
  });

  router.get("/:id/config", async (req: Request, res: Response) => {
    const businessId = getId(req);
    try {
      const config = await prisma.gestorConfig.findUnique({
        where: { businessId },
      });
      res.json(config);
    } catch (error) {
      res.status(404).json({ error: "Config not found" });
    }
  });

  router.put("/:id/config", async (req: Request, res: Response) => {
    const businessId = getId(req);
    const { businessId: _b, id: _id, ...configData } = req.body;
    try {
      const config = await prisma.gestorConfig.upsert({
        where: { businessId },
        update: configData,
        create: {
          ...configData,
          businessId,
        },
      });
      res.json(config);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  return router;
};

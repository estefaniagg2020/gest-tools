import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
  router.get("/:id/config", async (req: Request, res: Response) => {
    try {
      const config = await prisma.gestorConfig.findUnique({
        where: { businessId: req.params.id },
      });
      res.json(config);
    } catch (error) {
      res.status(404).json({ error: "Config not found" });
    }
  });

  router.put("/:id/config", async (req: Request, res: Response) => {
    const { businessId, id, ...configData } = req.body;
    try {
      const config = await prisma.gestorConfig.upsert({
        where: { businessId: req.params.id },
        update: configData,
        create: {
          ...configData,
          businessId: req.params.id,
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

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const companyRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const companies = await prisma.company.findMany({
        include: { businesses: true },
      });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const company = await prisma.company.create({
        data: req.body,
      });
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  return router;
};

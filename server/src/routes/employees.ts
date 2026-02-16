import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const employeeRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const employees = await prisma.employee.findMany({
        include: { business: true },
      });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const employee = await prisma.employee.create({
        data: req.body,
      });
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  return router;
};

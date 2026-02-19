import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireGestor } from "../middleware/auth.js";

const roleToDb = (role: string): "manager" | "member" | "admin" =>
  role === "manager" ? "manager" : role === "admin" ? "admin" : "member";

export const employeeRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/", auth, requireGestor, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    try {
      const employees = await prisma.employee.findMany({
        where: { businessId: req.user.businessId },
        orderBy: { name: "asc" },
      });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  router.post("/", auth, requireGestor, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    try {
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        res.status(400).json({ error: "name es requerido" });
        return;
      }
      const data = {
        businessId: req.user.businessId,
        name,
        photoUrl: typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : null,
        linkedInUrl: typeof body.linkedInUrl === "string" ? body.linkedInUrl.trim() || null : null,
        phoneNumber: typeof body.phoneNumber === "string" ? body.phoneNumber.trim() || null : null,
        email: typeof body.email === "string" ? body.email.trim() || null : null,
        weeklyHours: typeof body.weeklyHours === "number" ? body.weeklyHours : null,
        color: typeof body.color === "string" ? body.color.trim() || null : null,
        role: roleToDb(typeof body.role === "string" ? body.role : "member"),
        defaultWorkStartHour: typeof body.defaultWorkStartHour === "number" ? body.defaultWorkStartHour : null,
        defaultWorkEndHour: typeof body.defaultWorkEndHour === "number" ? body.defaultWorkEndHour : null,
      };
      const employee = await prisma.employee.create({ data });
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  router.put("/:id", auth, requireGestor, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    if (!id) {
      res.status(400).json({ error: "id es requerido" });
      return;
    }
    try {
      const existing = await prisma.employee.findUnique({ where: { id } });
      if (!existing || existing.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Empleado no encontrado" });
        return;
      }
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name.trim() : existing.name;
      if (!name) {
        res.status(400).json({ error: "name es requerido" });
        return;
      }
      const updateData = {
        name,
        photoUrl: typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : existing.photoUrl,
        linkedInUrl: typeof body.linkedInUrl === "string" ? body.linkedInUrl.trim() || null : existing.linkedInUrl,
        phoneNumber: typeof body.phoneNumber === "string" ? body.phoneNumber.trim() || null : existing.phoneNumber,
        email: typeof body.email === "string" ? body.email.trim() || null : existing.email,
        weeklyHours: typeof body.weeklyHours === "number" ? body.weeklyHours : existing.weeklyHours,
        color: typeof body.color === "string" ? body.color.trim() || null : existing.color,
        role: body.role != null ? roleToDb(String(body.role)) : existing.role,
        defaultWorkStartHour: typeof body.defaultWorkStartHour === "number" ? body.defaultWorkStartHour : existing.defaultWorkStartHour,
        defaultWorkEndHour: typeof body.defaultWorkEndHour === "number" ? body.defaultWorkEndHour : existing.defaultWorkEndHour,
      };
      const employee = await prisma.employee.update({
        where: { id },
        data: updateData,
      });
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  router.delete("/:id", auth, requireGestor, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    if (!id) {
      res.status(400).json({ error: "id es requerido" });
      return;
    }
    try {
      const existing = await prisma.employee.findUnique({ where: { id } });
      if (!existing || existing.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Empleado no encontrado" });
        return;
      }
      await prisma.employee.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  return router;
};

import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireGestor } from "../middleware/auth.js";

const roleToDb = (role: string): "admin" | "member" =>
  role === "admin" ? "admin" : "member";

export const employeeRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = req.user!.businessId;
    if (!businessId) {
      res.status(400).json({ error: "El usuario no tiene negocio asociado" });
      return;
    }
    try {
      const members = await prisma.workspaceMember.findMany({
        where: { businessId },
        orderBy: { name: "asc" },
      });
      res.json(members);
    } catch {
      res.status(500).json({ error: "Failed to fetch staff members" });
    }
  });

  router.post("/", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = req.user!.businessId;
    if (!businessId) {
      res.status(400).json({ error: "El usuario no tiene negocio asociado" });
      return;
    }
    try {
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        res.status(400).json({ error: "name es requerido" });
        return;
      }
      const member = await prisma.workspaceMember.create({
        data: {
          businessId,
          name,
          userId: typeof body.userId === "string" ? body.userId : null,
          photoUrl: typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : null,
          linkedInUrl: typeof body.linkedInUrl === "string" ? body.linkedInUrl.trim() || null : null,
          phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
          email: typeof body.email === "string" ? body.email.trim() || null : null,
          weeklyHours: typeof body.weeklyHours === "number" ? body.weeklyHours : null,
          color: typeof body.color === "string" ? body.color.trim() || null : null,
          position: typeof body.position === "string" ? body.position.trim() || null : null,
          role: roleToDb(typeof body.role === "string" ? body.role : "member"),
          defaultWorkStartHour: typeof body.defaultWorkStartHour === "number" ? body.defaultWorkStartHour : null,
          defaultWorkEndHour: typeof body.defaultWorkEndHour === "number" ? body.defaultWorkEndHour : null,
        },
      });
      res.status(201).json(member);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to create staff member";
      res.status(500).json({ error: msg });
    }
  });

  router.put("/:id", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = req.user!.businessId;
    const id = req.params.id as string;
    if (!businessId) {
      res.status(400).json({ error: "El usuario no tiene negocio asociado" });
      return;
    }
    try {
      const existing = await prisma.workspaceMember.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Miembro no encontrado" });
        return;
      }
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name.trim() : existing.name;
      if (!name) {
        res.status(400).json({ error: "name es requerido" });
        return;
      }
      const member = await prisma.workspaceMember.update({
        where: { id },
        data: {
          name,
          photoUrl: body.photoUrl !== undefined ? (body.photoUrl || null) : existing.photoUrl,
          linkedInUrl: body.linkedInUrl !== undefined ? (body.linkedInUrl || null) : existing.linkedInUrl,
          phone: body.phone !== undefined ? (body.phone || null) : existing.phone,
          email: body.email !== undefined ? (body.email || null) : existing.email,
          weeklyHours: body.weeklyHours !== undefined ? (typeof body.weeklyHours === "number" ? body.weeklyHours : null) : existing.weeklyHours,
          color: body.color !== undefined ? (body.color || null) : existing.color,
          position: body.position !== undefined ? (body.position || null) : existing.position,
          role: body.role != null ? roleToDb(String(body.role)) : existing.role,
          defaultWorkStartHour: body.defaultWorkStartHour !== undefined ? (typeof body.defaultWorkStartHour === "number" ? body.defaultWorkStartHour : null) : existing.defaultWorkStartHour,
          defaultWorkEndHour: body.defaultWorkEndHour !== undefined ? (typeof body.defaultWorkEndHour === "number" ? body.defaultWorkEndHour : null) : existing.defaultWorkEndHour,
        },
      });
      res.json(member);
    } catch {
      res.status(500).json({ error: "Failed to update staff member" });
    }
  });

  router.delete("/:id", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = req.user!.businessId;
    const id = req.params.id as string;
    if (!businessId) {
      res.status(400).json({ error: "El usuario no tiene negocio asociado" });
      return;
    }
    try {
      const existing = await prisma.workspaceMember.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Miembro no encontrado" });
        return;
      }
      await prisma.workspaceMember.delete({ where: { id } });
      res.status(204).send();
    } catch {
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  });

  return router;
};

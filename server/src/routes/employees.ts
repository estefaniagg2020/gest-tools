import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { hashPassword, generateSalt } from "../utils/password.js";
import { requireAuth, requireAdmin, requireStaff } from "../middleware/auth.js";

const VALID_ROLE_NAMES = new Set(["admin", "employee"]);

const resolveRoleId = async (prisma: PrismaClient, roleName: string): Promise<string | null> => {
  const normalized = VALID_ROLE_NAMES.has(roleName) ? roleName : "employee";
  const role = await prisma.role.findUnique({ where: { name: normalized } });
  return role?.id ?? null;
};

const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
};

export const employeeRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = req.user!.businessId;
    if (!businessId) {
      res.status(400).json({ error: "El usuario no tiene negocio asociado" });
      return;
    }
    try {
      const currentBusiness = await prisma.business.findUnique({
        where: { id: businessId },
        select: { companyId: true },
      });
      if (!currentBusiness) {
        res.status(404).json({ error: "Negocio no encontrado" });
        return;
      }
      const companyBusinesses = await prisma.business.findMany({
        where: { companyId: currentBusiness.companyId },
        select: { id: true },
      });
      const companyBusinessIds = companyBusinesses.map((business) => business.id);
      const members = await prisma.workspaceMember.findMany({
        where: { businessId: { in: companyBusinessIds } },
        include: { role: { select: { name: true } } },
        orderBy: { name: "asc" },
      });
      const result = members.map(({ roleId: _roleId, role, ...rest }) => ({
        ...rest,
        role: role.name,
      }));
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to fetch staff members" });
    }
  });

  router.post("/", auth, requireAdmin, async (req: Request, res: Response) => {
    const businessId = req.user!.businessId;
    const createdById = req.user!.id;
    if (!businessId) {
      res.status(400).json({ error: "El usuario no tiene negocio asociado" });
      return;
    }
    try {
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const normalizedEmail = normalizeEmail(body.email);
      if (!name) {
        res.status(400).json({ error: "name es requerido" });
        return;
      }
      const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const createWithLogin = username.length > 0 && password.length >= 4;
      if (username.length > 0 && password.length >= 4) {
        const existingUser = await prisma.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
        });
        if (existingUser) {
          res.status(409).json({ error: "Ese nombre de usuario ya está en uso" });
          return;
        }
      } else if (username.length > 0 || password.length > 0) {
        res.status(400).json({ error: "username y contraseña (mín. 4 caracteres) son requeridos para dar de alta al usuario" });
        return;
      }
      const roleId = await resolveRoleId(prisma, typeof body.role === "string" ? body.role : "employee");
      if (!roleId) {
        res.status(400).json({ error: "Rol no encontrado" });
        return;
      }
      const existingByName = await prisma.workspaceMember.findFirst({
        where: { businessId, name: { equals: name, mode: "insensitive" } },
      });
      if (existingByName) {
        res.status(409).json({ error: "Ya existe un miembro con ese nombre en este negocio" });
        return;
      }
      if (normalizedEmail) {
        const existingByEmailInBusiness = await prisma.workspaceMember.findFirst({
          where: { businessId, email: { equals: normalizedEmail, mode: "insensitive" } },
          select: { id: true },
        });
        if (existingByEmailInBusiness) {
          res.status(409).json({ error: "Ya existe un usuario con ese email en esta empresa" });
          return;
        }
      }
      const member = await prisma.$transaction(async (tx) => {
        let userId: string | null = null;
        if (createWithLogin) {
          const salt = generateSalt();
          const passwordHash = hashPassword(password, salt);
          const userRoleName = body.role === "admin" ? "admin" : "employee";
          const userRoleId = await prisma.role.findUnique({ where: { name: userRoleName } }).then((r) => r?.id);
          if (!userRoleId) {
            throw new Error("Rol no encontrado");
          }
          const newUser = await tx.user.create({
            data: {
              username,
              passwordHash,
              salt,
              roleId: userRoleId,
              name,
              email: normalizedEmail,
              createdById,
            },
          });
          userId = newUser.id;
        }
        const wm = await tx.workspaceMember.create({
          data: {
            businessId,
            name,
            roleId,
            userId,
            photoUrl: typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : null,
            linkedInUrl: typeof body.linkedInUrl === "string" ? body.linkedInUrl.trim() || null : null,
            phone: (typeof (body.phone ?? body.phoneNumber) === "string" ? String(body.phone ?? body.phoneNumber).trim() : null) || null,
            email: normalizedEmail,
            weeklyHours: typeof body.weeklyHours === "number" ? body.weeklyHours : null,
            color: typeof body.color === "string" ? body.color.trim() || null : null,
            position: typeof body.position === "string" ? body.position.trim() || null : null,
            defaultWorkStartHour: typeof body.defaultWorkStartHour === "number" ? body.defaultWorkStartHour : null,
            defaultWorkEndHour: typeof body.defaultWorkEndHour === "number" ? body.defaultWorkEndHour : null,
          },
          include: { role: { select: { name: true } } },
        });
        return wm;
      });
      const { roleId: _roleId, role, ...rest } = member;
      res.status(201).json({ ...rest, role: role.name });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to create staff member";
      res.status(500).json({ error: msg });
    }
  });

  router.put("/:id", auth, requireAdmin, async (req: Request, res: Response) => {
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
      const normalizedEmail = body.email !== undefined ? normalizeEmail(body.email) : existing.email;
      if (!name) {
        res.status(400).json({ error: "name es requerido" });
        return;
      }
      if (name !== existing.name) {
        const conflict = await prisma.workspaceMember.findFirst({
          where: { businessId, id: { not: id }, name: { equals: name, mode: "insensitive" } },
        });
        if (conflict) {
          res.status(409).json({ error: "Ya existe un miembro con ese nombre en este negocio" });
          return;
        }
      }
      if (normalizedEmail) {
        const conflictByEmail = await prisma.workspaceMember.findFirst({
          where: {
            businessId,
            id: { not: id },
            email: { equals: normalizedEmail, mode: "insensitive" },
          },
          select: { id: true },
        });
        if (conflictByEmail) {
          res.status(409).json({ error: "Ya existe un usuario con ese email en esta empresa" });
          return;
        }
      }
      const data: Record<string, unknown> = {
        name,
        photoUrl: body.photoUrl !== undefined ? (body.photoUrl || null) : existing.photoUrl,
        linkedInUrl: body.linkedInUrl !== undefined ? (body.linkedInUrl || null) : existing.linkedInUrl,
        phone: (body.phone ?? body.phoneNumber) !== undefined ? ((body.phone ?? body.phoneNumber) || null) : existing.phone,
        email: normalizedEmail,
        weeklyHours: body.weeklyHours !== undefined ? (typeof body.weeklyHours === "number" ? body.weeklyHours : null) : existing.weeklyHours,
        color: body.color !== undefined ? (body.color || null) : existing.color,
        position: body.position !== undefined ? (body.position || null) : existing.position,
        defaultWorkStartHour: body.defaultWorkStartHour !== undefined ? (typeof body.defaultWorkStartHour === "number" ? body.defaultWorkStartHour : null) : existing.defaultWorkStartHour,
        defaultWorkEndHour: body.defaultWorkEndHour !== undefined ? (typeof body.defaultWorkEndHour === "number" ? body.defaultWorkEndHour : null) : existing.defaultWorkEndHour,
      };
      if (body.role != null) {
        const roleId = await resolveRoleId(prisma, String(body.role));
        if (!roleId) {
          res.status(400).json({ error: "Rol no encontrado" });
          return;
        }
        data.roleId = roleId;
      }
      const member = await prisma.workspaceMember.update({
        where: { id },
        data,
        include: { role: { select: { name: true } } },
      });
      const { roleId: _roleId, role, ...rest } = member;
      res.json({ ...rest, role: role.name });
    } catch {
      res.status(500).json({ error: "Failed to update staff member" });
    }
  });

  router.delete("/:id", auth, requireAdmin, async (req: Request, res: Response) => {
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

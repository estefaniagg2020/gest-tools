import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  generateSalt,
  generateSessionToken,
} from "../utils/password.js";
import { requireAuth } from "../middleware/auth.js";

const getRoleId = async (prisma: PrismaClient, name: string): Promise<string> => {
  const role = await prisma.role.findUniqueOrThrow({ where: { name } });
  return role.id;
};

export const authRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/setup-status", async (_req: Request, res: Response) => {
    const count = await prisma.user.count();
    res.json({ hasUsers: count > 0 });
  });

  router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (!username || typeof username !== "string" || !password) {
      res.status(400).json({ error: "Usuario y contraseña requeridos" });
      return;
    }
    const trimmed = username.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        username: { equals: trimmed, mode: "insensitive" },
      },
      include: { role: { select: { name: true } } },
    });
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      return;
    }
    const token = generateSessionToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionToken: token },
    });
    let workspaces = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      select: { businessId: true },
      take: 1,
    });
    const isStaff = user.role.name !== "client";
    if (workspaces.length === 0 && isStaff) {
      const adminRoleId = await getRoleId(prisma, "admin");
      const { businessId } = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({ data: { name: user.username } });
        const business = await tx.business.create({ data: { name: user.username, companyId: company.id } });
        await tx.workspaceMember.create({
          data: { userId: user.id, businessId: business.id, roleId: adminRoleId, name: user.username },
        });
        return { businessId: business.id };
      });
      workspaces = [{ businessId }];
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessId: workspaces[0]?.businessId ?? null,
      },
      token,
    });
  });

  router.post("/register", async (req: Request, res: Response) => {
    const count = await prisma.user.count();
    if (count > 0) {
      res.status(403).json({ error: "Ya existe un usuario registrado" });
      return;
    }
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (!username || typeof username !== "string" || !password) {
      res.status(400).json({ error: "Usuario y contraseña requeridos" });
      return;
    }
    const trimmed = username.trim();
    if (trimmed.length < 1) {
      res.status(400).json({ error: "El usuario no puede estar vacío" });
      return;
    }
    if (password.length < 4) {
      res.status(400).json({
        error: "La contraseña debe tener al menos 4 caracteres",
      });
      return;
    }
    const existing = await prisma.user.findFirst({
      where: { username: { equals: trimmed, mode: "insensitive" } },
    });
    if (existing) {
      res.status(400).json({ error: "Ese usuario ya existe" });
      return;
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const superadminRoleId = await getRoleId(prisma, "superadmin");
    const adminRoleId = await getRoleId(prisma, "admin");

    const { user, businessId } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { username: trimmed, passwordHash, salt, roleId: superadminRoleId },
      });
      const company = await tx.company.create({
        data: { name: trimmed },
      });
      const business = await tx.business.create({
        data: { name: trimmed, companyId: company.id },
      });
      await tx.workspaceMember.create({
        data: { userId: newUser.id, businessId: business.id, roleId: adminRoleId, name: trimmed },
      });
      return { user: newUser, businessId: business.id };
    });

    const token = generateSessionToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionToken: token },
    });
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: "superadmin",
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessId,
      },
      token,
    });
  });

  router.post("/forgot-password", async (req: Request, res: Response) => {
    const { username, newPassword } = req.body as {
      username?: string;
      newPassword?: string;
    };
    if (!username || typeof username !== "string" || !newPassword) {
      res.status(400).json({
        error: "Usuario y nueva contraseña requeridos",
      });
      return;
    }
    if (newPassword.length < 4) {
      res.status(400).json({
        error: "La nueva contraseña debe tener al menos 4 caracteres",
      });
      return;
    }
    const user = await prisma.user.findFirst({
      where: { username: { equals: username.trim(), mode: "insensitive" } },
    });
    if (!user) {
      res.status(404).json({ error: "No existe ninguna cuenta con ese usuario" });
      return;
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, salt, sessionToken: null },
    });
    res.json({ ok: true });
  });

  router.post(
    "/change-password",
    auth,
    async (req: Request, res: Response) => {
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };
      if (!req.user) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: "Contraseña actual y nueva contraseña requeridas",
        });
        return;
      }
      if (newPassword.length < 4) {
        res.status(400).json({
          error: "La nueva contraseña debe tener al menos 4 caracteres",
        });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (!user || !verifyPassword(currentPassword, user.salt, user.passwordHash)) {
        res.status(401).json({ error: "Contraseña actual incorrecta" });
        return;
      }
      const salt = generateSalt();
      const passwordHash = hashPassword(newPassword, salt);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash, salt, sessionToken: null },
      });
      res.json({ ok: true });
    },
  );

  router.post("/logout", auth, async (req: Request, res: Response) => {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { sessionToken: null },
      });
    }
    res.json({ ok: true });
  });

  router.patch("/me", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { name, phone } = req.body as { name?: string; phone?: string };
    const data: Record<string, string | null> = {};
    if (typeof name === "string") data.name = name.trim() || null;
    if (typeof phone === "string") data.phone = phone.trim() || null;
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "Nada que actualizar" });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: data as { name?: string | null; phone?: string | null },
      include: { role: { select: { name: true } } },
    });
    const workspaces = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      select: { businessId: true },
      take: 1,
    });
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        businessId: workspaces[0]?.businessId ?? null,
      },
    });
  });

  return router;
};

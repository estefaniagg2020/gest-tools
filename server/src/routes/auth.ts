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

const getPrimaryWorkspaceBusinessId = async (
  prisma: PrismaClient,
  userId: string,
): Promise<string | null> => {
  const workspace = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { businessId: true },
    orderBy: { createdAt: "desc" },
  });
  return workspace?.businessId ?? null;
};

const resolveWorkspaceRoleName = (roleName: string): "admin" | "employee" => {
  if (roleName === "admin" || roleName === "superadmin") return "admin";
  return "employee";
};

const attachUserToCreatorBusinessIfNeeded = async (
  prisma: PrismaClient,
  user: { id: string; username: string; roleName: string; createdById: string | null },
): Promise<string | null> => {
  const existingBusinessId = await getPrimaryWorkspaceBusinessId(prisma, user.id);
  if (existingBusinessId) return existingBusinessId;
  if (!user.createdById) return null;
  const creatorBusinessId = await getPrimaryWorkspaceBusinessId(
    prisma,
    user.createdById,
  );
  if (!creatorBusinessId) return null;
  const roleName = resolveWorkspaceRoleName(user.roleName);
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    select: { id: true },
  });
  if (!role) return null;
  const alreadyLinked = await prisma.workspaceMember.findFirst({
    where: { userId: user.id, businessId: creatorBusinessId },
    select: { id: true },
  });
  if (!alreadyLinked) {
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        businessId: creatorBusinessId,
        roleId: role.id,
        name: user.username,
      },
    });
  }
  return creatorBusinessId;
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
    let businessId = await attachUserToCreatorBusinessIfNeeded(prisma, {
      id: user.id,
      username: user.username,
      roleName: user.role.name,
      createdById: user.createdById ?? null,
    });
    if (!businessId) {
      businessId = await getPrimaryWorkspaceBusinessId(prisma, user.id);
    }
    const isStaff = user.role.name !== "client";
    if (!businessId && isStaff) {
      const adminRoleId = await getRoleId(prisma, "admin");
      const created = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({ data: { name: user.username } });
        const business = await tx.business.create({ data: { name: user.username, companyId: company.id } });
        await tx.workspaceMember.create({
          data: { userId: user.id, businessId: business.id, roleId: adminRoleId, name: user.username },
        });
        return business.id;
      });
      businessId = created;
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessId,
      },
      token,
    });
  });

  router.post("/register", async (req: Request, res: Response) => {
    const { username, password, email } = req.body as {
      username?: string;
      password?: string;
      email?: string;
    };
    if (!username || typeof username !== "string" || !password) {
      res.status(400).json({ error: "Usuario y contraseña requeridos" });
      return;
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({ error: "El email es obligatorio" });
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

    const trimmedEmail = email.trim().toLowerCase();
    const { user, businessId } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: trimmed,
          passwordHash,
          salt,
          roleId: superadminRoleId,
          email: trimmedEmail,
        },
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

  router.post("/activate-account", async (req: Request, res: Response) => {
    const { email, username, password } = req.body as {
      email?: string;
      username?: string;
      password?: string;
    };
    if (!email || !username || !password) {
      res.status(400).json({ error: "Email, usuario y contraseña son requeridos" });
      return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 1) {
      res.status(400).json({ error: "El usuario no puede estar vacío" });
      return;
    }
    if (password.length < 4) {
      res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres" });
      return;
    }
    // Find WorkspaceMember by email with no linked user account
    const member = await prisma.workspaceMember.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" }, userId: null },
      include: { role: { select: { name: true } } },
    });
    if (!member) {
      res.status(404).json({ error: "No se encontró ningún empleado con ese email sin cuenta activa. Comprueba que el email es correcto y que aún no tienes cuenta." });
      return;
    }
    const existingUser = await prisma.user.findFirst({
      where: { username: { equals: trimmedUsername, mode: "insensitive" } },
    });
    if (existingUser) {
      res.status(400).json({ error: "Ese nombre de usuario ya está en uso, elige otro" });
      return;
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const roleName = member.role.name === "admin" ? "admin" : "employee";
    const roleId = await getRoleId(prisma, roleName);
    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { username: trimmedUsername, passwordHash, salt, roleId, name: member.name, email: trimmedEmail },
      });
      await tx.workspaceMember.update({ where: { id: member.id }, data: { userId: u.id } });
      return u;
    });
    const token = generateSessionToken();
    await prisma.user.update({ where: { id: newUser.id }, data: { sessionToken: token } });
    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        role: roleName,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        businessId: member.businessId,
      },
      token,
    });
  });

  router.post("/forgot-password", async (req: Request, res: Response) => {
    const { email, newPassword } = req.body as {
      email?: string;
      newPassword?: string;
    };
    if (!email || typeof email !== "string" || !newPassword) {
      res.status(400).json({
        error: "Email y nueva contraseña requeridos",
      });
      return;
    }
    if (newPassword.length < 4) {
      res.status(400).json({
        error: "La nueva contraseña debe tener al menos 4 caracteres",
      });
      return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
    });
    if (!user) {
      res.status(404).json({ error: "No existe ninguna cuenta con ese email" });
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

  router.get("/me", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: { select: { name: true } },
        createdBy: { select: { id: true, username: true, name: true } },
      },
    });
    if (!user) {
      res.status(401).json({ error: "Sesión inválida o expirada" });
      return;
    }
    let businessId = await attachUserToCreatorBusinessIfNeeded(prisma, {
      id: user.id,
      username: user.username,
      roleName: user.role.name,
      createdById: user.createdById ?? null,
    });
    if (!businessId) {
      businessId = await getPrimaryWorkspaceBusinessId(prisma, user.id);
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessId,
        createdById: user.createdById ?? null,
        createdBy: user.createdBy ? { id: user.createdBy.id, username: user.createdBy.username, name: user.createdBy.name } : null,
      },
    });
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
    const businessId = await getPrimaryWorkspaceBusinessId(prisma, user.id);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        businessId,
      },
    });
  });

  return router;
};

import { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";
import type { RoleName } from "../types/express.js";

const STAFF_ROLES: ReadonlySet<RoleName> = new Set(["superadmin", "admin", "employee"]);
const isStaffRole = (role: string): role is RoleName =>
  role === "superadmin" || role === "admin" || role === "employee";

const ensureBusinessIdForUser = async (
  prisma: PrismaClient,
  user: {
    id: string;
    username: string;
    createdById: string | null;
    role: { name: string };
    workspaces: { businessId: string; createdAt: Date }[];
  },
): Promise<string | null> => {
  const currentBusinessId = user.workspaces[0]?.businessId ?? null;
  if (currentBusinessId) return currentBusinessId;
  if (user.createdById) {
    const creatorWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: user.createdById },
      select: { businessId: true },
      orderBy: { createdAt: "desc" },
    });
    if (creatorWorkspace?.businessId) {
      const roleName = user.role.name === "admin" || user.role.name === "superadmin"
        ? "admin"
        : "employee";
      const role = await prisma.role.findUnique({
        where: { name: roleName },
        select: { id: true },
      });
      if (role) {
        const link = await prisma.workspaceMember.findFirst({
          where: { userId: user.id, businessId: creatorWorkspace.businessId },
          select: { id: true },
        });
        if (!link) {
          await prisma.workspaceMember.create({
            data: {
              userId: user.id,
              businessId: creatorWorkspace.businessId,
              roleId: role.id,
              name: user.username,
            },
          });
        }
      }
      return creatorWorkspace.businessId;
    }
  }
  if (!isStaffRole(user.role.name)) return null;
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
    select: { id: true },
  });
  if (!adminRole) return null;
  const created = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({ data: { name: user.username } });
    const business = await tx.business.create({
      data: { name: user.username, companyId: company.id },
    });
    await tx.workspaceMember.create({
      data: {
        userId: user.id,
        businessId: business.id,
        roleId: adminRole.id,
        name: user.username,
      },
    });
    return business.id;
  });
  return created;
};

export const requireAuth = (prisma: PrismaClient) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const user = await prisma.user.findFirst({
      where: { sessionToken: token },
      select: {
        id: true,
        username: true,
        createdById: true,
        role: { select: { name: true } },
        name: true,
        email: true,
        phone: true,
        workspaces: {
          select: { businessId: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        }
      },
    });
    if (!user) {
      res.status(401).json({ error: "Sesión inválida o expirada" });
      return;
    }
    const businessId = await ensureBusinessIdForUser(prisma, user);
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role.name as RoleName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessId,
    };
    next();
  };
};

export const requireStaff = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!_req.user || !STAFF_ROLES.has(_req.user.role)) {
    res.status(403).json({ error: "Acceso denegado" });
    return;
  }
  next();
};

export const requireAdmin = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!_req.user || (_req.user.role !== "admin" && _req.user.role !== "superadmin")) {
    res.status(403).json({ error: "Acceso denegado: se requiere rol admin" });
    return;
  }
  next();
};

export const requireSuperadmin = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!_req.user || _req.user.role !== "superadmin") {
    res.status(403).json({ error: "Acceso denegado: se requiere rol superadmin" });
    return;
  }
  next();
};

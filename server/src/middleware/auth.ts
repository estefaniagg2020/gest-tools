import { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";
import type { RoleName } from "../types/express.js";

const STAFF_ROLES: ReadonlySet<RoleName> = new Set(["superadmin", "admin", "employee"]);

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
        role: { select: { name: true } },
        name: true,
        email: true,
        phone: true,
        workspaces: {
          select: { businessId: true },
          take: 1
        }
      },
    });
    if (!user) {
      res.status(401).json({ error: "Sesión inválida o expirada" });
      return;
    }
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role.name as RoleName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessId: user.workspaces[0]?.businessId ?? null,
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

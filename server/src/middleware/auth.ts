import { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";

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
        role: true,
        name: true,
        email: true,
        phone: true,
        businessId: true,
      },
    });
    if (!user) {
      res.status(401).json({ error: "Sesión inválida o expirada" });
      return;
    }
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessId: user.businessId,
    };
    next();
  };
};

export const requireGestor = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!_req.user || _req.user.role !== "gestor") {
    res.status(403).json({ error: "Acceso denegado" });
    return;
  }
  next();
};

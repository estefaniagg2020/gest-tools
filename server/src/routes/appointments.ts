import { Router, Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/index.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

export const appointmentsRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  const getBizId = (req: Request): string => req.user?.businessId ?? "";

  router.get("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const appointments = await prisma.appointment.findMany({
        where: { businessId },
        orderBy: { start: "asc" },
      });
      const mapped = appointments.map((a) => ({
        ...a,
        memberId: a.workspaceMemberId,
        cartItems: a.cartItems ?? undefined,
        start: a.start.toISOString(),
        end: a.end.toISOString(),
      }));
      res.json(mapped);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  router.post("/", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const { start, end } = body;
    if (!start || !end) { res.status(400).json({ error: "start y end son requeridos" }); return; }
    try {
      const data: Parameters<typeof prisma.appointment.create>[0]["data"] = {
        businessId,
        start: new Date(start),
        end: new Date(end),
        status: body.status ?? "pending",
        paymentStatus: body.paymentStatus ?? "pending",
        serviceId: body.serviceId ?? null,
        workspaceMemberId: body.memberId ?? body.workspaceMemberId ?? null,
        clientId: body.clientId ?? null,
        clientName: body.clientName ?? null,
        notes: body.notes ?? null,
        cancellationReason: body.cancellationReason ?? null,
        isAtHome: body.isAtHome ?? false,
        isVIP: body.isVIP ?? false,
        cartItems: body.cartItems ?? null,
        discountPercent: body.discountPercent ?? null,
      };
      const appointment = await prisma.appointment.create({ data });
      res.status(201).json({
        ...appointment,
        memberId: appointment.workspaceMemberId,
        start: appointment.start.toISOString(),
        end: appointment.end.toISOString(),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to create appointment";
      res.status(500).json({ error: msg });
    }
  });

  router.put("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.appointment.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Cita no encontrada" }); return;
      }
      const body = req.body ?? {};
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          ...(body.start !== undefined && { start: new Date(body.start) }),
          ...(body.end !== undefined && { end: new Date(body.end) }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.paymentStatus !== undefined && { paymentStatus: body.paymentStatus }),
          ...(body.serviceId !== undefined && { serviceId: body.serviceId }),
          ...("memberId" in body && { workspaceMemberId: body.memberId }),
          ...(body.clientId !== undefined && { clientId: body.clientId }),
          ...(body.clientName !== undefined && { clientName: body.clientName }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.cancellationReason !== undefined && { cancellationReason: body.cancellationReason }),
          ...(body.isAtHome !== undefined && { isAtHome: body.isAtHome }),
          ...(body.isVIP !== undefined && { isVIP: body.isVIP }),
          ...(body.cartItems !== undefined && { cartItems: body.cartItems }),
          ...(body.discountPercent !== undefined && { discountPercent: body.discountPercent }),
        },
      });
      res.json({ ...updated, memberId: updated.workspaceMemberId, start: updated.start.toISOString(), end: updated.end.toISOString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  router.delete("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    const businessId = getBizId(req);
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id ?? "";
    try {
      const existing = await prisma.appointment.findUnique({ where: { id } });
      if (!existing || existing.businessId !== businessId) {
        res.status(404).json({ error: "Cita no encontrada" }); return;
      }
      await prisma.appointment.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  return router;
};

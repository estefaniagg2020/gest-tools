import { Router, Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/index.js";
import { requireAuth } from "../middleware/auth.js";
import { sendAppointmentConfirmation } from "../services/whatsapp.js";
import { notifyWaitlistForFreedSlot } from "../services/waitlist.js";

const formatDateForWhatsApp = (date: Date): string =>
  date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const formatTimeForWhatsApp = (date: Date): string =>
  date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

export const bookingsRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.post("/", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    if (req.user.role !== "client") {
      res.status(403).json({ error: "Solo clientes pueden crear reservas" });
      return;
    }
    const { businessId, serviceId, start, end, discountPercent } = req.body as {
      businessId?: string;
      serviceId?: string;
      start?: string;
      end?: string;
      discountPercent?: number;
    };
    if (!businessId || !serviceId || !start || !end) {
      res.status(400).json({
        error: "businessId, serviceId, start e end son requeridos",
      });
      return;
    }
    const service = await prisma.businessService.findFirst({
      where: { id: serviceId, businessId },
    });
    if (!service) {
      res.status(404).json({ error: "Servicio no encontrado" });
      return;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ error: "Fechas inválidas" });
      return;
    }
    const durationMs = service.duration * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() !== durationMs) {
      res.status(400).json({
        error: "La duración del hueco no coincide con el servicio",
      });
      return;
    }
    const overlapping = await prisma.appointment.findFirst({
      where: {
        businessId,
        status: "confirmed",
        start: { lt: endDate },
        end: { gt: startDate },
      },
    });
    if (overlapping) {
      res.status(409).json({ error: "El hueco ya no está disponible" });
      return;
    }
    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        serviceId,
        userId: req.user.id,
        start: startDate,
        end: endDate,
        status: "confirmed",
        paymentStatus: "paid",
        discountPercent:
          discountPercent != null && discountPercent > 0 ? discountPercent : null,
      },
      include: {
        service: true,
        business: { select: { name: true } },
      },
    });

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const config = await prisma.gestorConfig.findUnique({
      where: { businessId },
    });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { phone: true, name: true },
    });
    if (
      config?.whatsappRemindersEnabled &&
      config.whatsappPhoneNumberId &&
      accessToken &&
      user?.phone
    ) {
      sendAppointmentConfirmation(
        config.whatsappPhoneNumberId,
        accessToken,
        user.phone,
        {
          clientName: user.name ?? req.user.username ?? "Cliente",
          serviceName: service.name,
          businessName: (appointment as any).business?.name ?? "Negocio",
          dateFormatted: formatDateForWhatsApp(startDate),
          timeFormatted: formatTimeForWhatsApp(startDate),
        },
      ).catch((err) => {
        console.error("[WhatsApp] Error enviando confirmación:", err);
      });
    }

    res.status(201).json(appointment);
  });

  router.post("/:id/cancel", auth, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ error: "id de reserva requerido" });
      return;
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!appointment) {
      res.status(404).json({ error: "Reserva no encontrada" });
      return;
    }
    if (appointment.userId !== req.user.id && req.user.role === "client") {
      res.status(403).json({ error: "No puedes cancelar esta reserva" });
      return;
    }
    if (appointment.status === "cancelled") {
      res.json(appointment);
      return;
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled" },
      include: {
        service: true,
        business: { select: { name: true } },
      },
    });
    if (appointment.serviceId) {
      await notifyWaitlistForFreedSlot(
        prisma,
        appointment.businessId,
        appointment.serviceId,
        appointment.start,
        appointment.end,
      );
    }
    res.json(updated);
  });

  return router;
};

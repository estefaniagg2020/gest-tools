import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { sendAppointmentReminder } from "../services/whatsapp.js";

const formatDateForWhatsApp = (date: Date): string =>
  date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTimeForWhatsApp = (date: Date): string =>
  date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

export const remindersRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.post("/send", async (req: Request, res: Response) => {
    const secret = req.headers["x-cron-secret"];
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
      res.status(503).json({
        error: "WhatsApp no configurado (WHATSAPP_ACCESS_TOKEN)",
      });
      return;
    }
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const appointments = await prisma.appointment.findMany({
      where: {
        start: { gte: now, lte: in24h },
        status: "confirmed",
      },
      include: {
        service: true,
        business: { select: { name: true } },
        user: { select: { phone: true, name: true, username: true } },
      },
    });
    const configs = await prisma.gestorConfig.findMany({
      where: {
        whatsappRemindersEnabled: true,
        whatsappPhoneNumberId: { not: null },
      },
    });
    const configByBusiness = new Map(
      configs.map((c) => [c.businessId, c]),
    );
    let sent = 0;
    let errors = 0;
    for (const apt of appointments) {
      const config = configByBusiness.get(apt.businessId);
      if (!config?.whatsappPhoneNumberId || !apt.user?.phone) continue;
      const start = new Date(apt.start);
      const result = await sendAppointmentReminder(
        config.whatsappPhoneNumberId,
        accessToken,
        apt.user.phone,
        {
          clientName:
            apt.user.name ?? apt.user.username ?? "Cliente",
          serviceName: apt.service.name,
          businessName: apt.business.name,
          dateFormatted: formatDateForWhatsApp(start),
          timeFormatted: formatTimeForWhatsApp(start),
        },
      );
      if (result.success) sent++;
      else errors++;
    }
    res.json({ sent, errors, total: appointments.length });
  });

  return router;
};

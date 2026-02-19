import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth, requireGestor } from "../middleware/auth.js";

const SETTINGS_KEYS = [
  // Layout
  "sidebarPosition", "showNavbar", "calendarAppearance",
  "sidebarModuleIds", "dashboardModuleIds",
  // Theme
  "themeId", "colorMode", "customColors", "titleTextOverrides",
  // Module icons
  "moduleIcons",
  // Agenda colors
  "sameColorsForAll", "agendaBg", "markedDaysColor", "vacationColor", "perAgendaColors",
  // Scheduler
  "startHour", "endHour", "pixelsPerHour", "slotDurationMinutes",
  "workDaysPerWeek", "maxPeoplePerSlot", "defaultView", "weekStart",
  // Agenda list
  "agendaListConfig",
  // Business config
  "logoUrl", "numberOfPeople", "businessType", "email", "phone", "address",
  "onboardingComplete",
  // Billing
  "defaultVatPercent", "cartEnabled",
  // Modules
  "bonosEnabled", "serviciosEnabled", "inventarioEnabled",
  "hiddenSystemServiceNames",
  // WhatsApp
  "whatsappRemindersEnabled", "whatsappPhoneNumberId",
  // Smart filling
  "smartFillingEnabled", "smartFillingDiscountPercent",
  // Locale
  "locale",
] as const;

export const settingsRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  router.get("/", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    try {
      const config = await prisma.gestorConfig.findUnique({ where: { businessId } });
      res.json(config ?? {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  router.patch("/", auth, requireGestor, async (req: Request, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) { res.status(403).json({ error: "Negocio no asociado" }); return; }
    const body = req.body ?? {};
    const data: Record<string, unknown> = {};
    for (const key of SETTINGS_KEYS) {
      if (key in body) data[key] = body[key];
    }
    try {
      const config = await prisma.gestorConfig.upsert({
        where: { businessId },
        update: data,
        create: { ...data, businessId },
      });
      res.json(config);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update settings";
      res.status(500).json({ error: msg });
    }
  });

  return router;
};

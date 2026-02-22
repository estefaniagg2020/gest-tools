import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  getAvailableSlots,
  getSmartSlots,
  getOccupiedSlots,
} from "../services/availability.js";

export const businessRouter = (prisma: PrismaClient) => {
  const router = Router();
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUuid = (value: string): boolean => UUID_REGEX.test(value);

  router.get("/", async (req: Request, res: Response) => {
    try {
      const businesses = await prisma.business.findMany({
        include: { gestorConfig: true, company: true },
      });
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const business = await prisma.business.create({
        data: req.body,
      });
      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business" });
    }
  });

  // Gestor Config routes
  const getId = (req: Request): string => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] ?? "" : id ?? "";
  };
  const requireValidBusinessId = (req: Request, res: Response): string | null => {
    const businessId = getId(req);
    if (!isUuid(businessId)) {
      res.status(400).json({ error: "businessId inválido" });
      return null;
    }
    return businessId;
  };

  const buildServiceCatalog = async (businessId: string) => {
    const [config, business] = await Promise.all([
      prisma.gestorConfig.findUnique({ where: { businessId } }),
      prisma.business.findUnique({ where: { id: businessId }, select: { professionId: true } }),
    ]);
    const professionId = business?.professionId ?? "";
    const hiddenNames = new Set(
      (config?.hiddenSystemServiceNames ?? []).map((n: string) => n.toLowerCase()),
    );

    const [systemCategories, userServices] = await Promise.all([
      professionId
        ? prisma.professionCategory.findMany({
            where: { professionId },
            orderBy: { label: "asc" },
            include: {
              services: { orderBy: { name: "asc" } },
            },
          })
        : Promise.resolve([]),
      prisma.businessService.findMany({
        where: { businessId },
        orderBy: { name: "asc" },
        include: { businessCategory: { select: { id: true, label: true, icon: true } } },
      }),
    ]);

    const catalogMap = new Map<string, {
      id: string; label: string; icon: string; isSystem: boolean;
      services: { id: string; name: string; duration: number; price: number; description: string | null; isSystemService: boolean }[];
    }>();

    for (const cat of systemCategories) {
      catalogMap.set(cat.id, {
        id: cat.id,
        label: cat.label,
        icon: cat.icon ?? "",
        isSystem: true,
        services: cat.services
          .filter((s) => !hiddenNames.has(s.name.toLowerCase()))
          .map((s) => ({
            id: s.id,
            name: s.name,
            duration: s.duration,
            price: Number(s.price),
            description: s.description,
            isSystemService: true,
          })),
      });
    }

    for (const svc of userServices) {
      const catId = svc.categoryId;
      const catLabel = svc.businessCategory?.label ?? "Sin categoría";
      const catIcon = svc.businessCategory?.icon ?? "📋";
      if (!catalogMap.has(catId as string)) {
        catalogMap.set(catId as string, { id: catId as string, label: catLabel, icon: catIcon, isSystem: false, services: [] });
      }
      catalogMap.get(catId as string)!.services.push({
        id: svc.id,
        name: svc.name,
        duration: svc.duration,
        price: Number(svc.price),
        description: svc.description,
        isSystemService: false,
      });
    }

    return Array.from(catalogMap.values());
  };

  router.get("/:id/catalog", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    try {
      const catalog = await buildServiceCatalog(businessId);
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service catalog" });
    }
  });

  router.get("/:id/services", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    try {
      const catalog = await buildServiceCatalog(businessId);
      const flat = catalog.flatMap((cat) =>
        cat.services.map((s) => ({
          ...s,
          category: cat.label,
          categoryId: cat.id,
          businessCategory: { id: cat.id, label: cat.label, icon: cat.icon },
        })),
      );
      res.json(flat);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  router.post("/:id/services", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    const { name, duration, price, description, categoryId } = req.body ?? {};
    if (!name || !duration || !categoryId) {
      res.status(400).json({ error: "name, duration and categoryId are required" });
      return;
    }
    try {
      const service = await prisma.businessService.create({
        data: {
          businessId,
          name,
          duration: Number(duration),
          price: price != null ? Number(price) : 0,
          description: description ?? null,
          categoryId,
          category: "", // Hack for persistent lint if Prisma types are stale
        } as any,
        include: { businessCategory: true },
      });
      res.status(201).json({
        id: service.id,
        name: service.name,
        category: (service as any).businessCategory?.label || "Sin categoría",
        categoryId: service.categoryId,
        duration: service.duration,
        price: service.price,
        description: service.description,
        businessCategory: (service as any).businessCategory,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create service";
      res.status(500).json({ error: message });
    }
  });

  router.put("/:id/services/:serviceId", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    const serviceId = req.params.serviceId as string;
    const { name, duration, price, description, categoryId } = req.body ?? {};
    try {
      const systemSvc = await prisma.professionService.findUnique({
        where: { id: serviceId },
        include: { category: true },
      });

      if (systemSvc) {
        const config = await prisma.gestorConfig.findUnique({ where: { businessId } });
        const hiddenNames: string[] = config?.hiddenSystemServiceNames ?? [];
        if (!hiddenNames.map((n) => n.toLowerCase()).includes(systemSvc.name.toLowerCase())) {
          await prisma.gestorConfig.upsert({
            where: { businessId },
            update: { hiddenSystemServiceNames: [...hiddenNames, systemSvc.name] },
            create: { businessId, hiddenSystemServiceNames: [systemSvc.name] },
          });
        }

        const resolvedCategoryId = categoryId ?? await (async () => {
          const existing = await prisma.businessCategory.findFirst({
            where: { businessId, label: systemSvc.category.label },
          });
          if (existing) return existing.id;
          const created = await prisma.businessCategory.create({
            data: { businessId, label: systemSvc.category.label, icon: systemSvc.category.icon },
          });
          return created.id;
        })();

        const created = await prisma.businessService.create({
          data: {
            businessId,
            name: name ?? systemSvc.name,
            duration: duration != null ? Number(duration) : systemSvc.duration,
            price: price != null ? Number(price) : systemSvc.price,
            description: description ?? systemSvc.description ?? null,
            categoryId: resolvedCategoryId,
            category: "", // Hack for persistent lint
          } as any,
          include: { businessCategory: true },
        });
        res.json({
          id: created.id,
          name: created.name,
          category: (created as any).businessCategory?.label || "Sin categoría",
          categoryId: created.categoryId,
          duration: created.duration,
          price: created.price,
          description: created.description,
          isSystemService: false,
          businessCategory: (created as any).businessCategory,
        });
        return;
      }

      const existing = await prisma.businessService.findFirst({ where: { id: serviceId, businessId } });
      if (!existing) {
        res.status(404).json({ error: "Service not found" });
        return;
      }
      const updated = await prisma.businessService.update({
        where: { id: serviceId },
        data: {
          ...(name !== undefined && { name }),
          ...(duration !== undefined && { duration: Number(duration) }),
          ...(price !== undefined && { price: Number(price) }),
          ...(description !== undefined && { description }),
          ...(categoryId !== undefined && { categoryId }),
        },
        include: { businessCategory: true },
      });
      res.json({
        id: updated.id,
        name: updated.name,
        category: updated.businessCategory.label,
        categoryId: updated.categoryId,
        duration: updated.duration,
        price: updated.price,
        description: updated.description,
        isSystemService: false,
        businessCategory: updated.businessCategory,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update service";
      res.status(500).json({ error: message });
    }
  });

  router.delete("/:id/services/:serviceId", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    const serviceId = req.params.serviceId as string;
    try {
      const systemSvc = await prisma.professionService.findUnique({ where: { id: serviceId } });
      if (systemSvc) {
        const config = await prisma.gestorConfig.findUnique({ where: { businessId } });
        const hiddenNames: string[] = config?.hiddenSystemServiceNames ?? [];
        if (!hiddenNames.map((n) => n.toLowerCase()).includes(systemSvc.name.toLowerCase())) {
          await prisma.gestorConfig.upsert({
            where: { businessId },
            update: { hiddenSystemServiceNames: [...hiddenNames, systemSvc.name] },
            create: { businessId, hiddenSystemServiceNames: [systemSvc.name] },
          });
        }
        res.status(204).end();
        return;
      }

      const existing = await prisma.businessService.findFirst({ where: { id: serviceId, businessId } });
      if (!existing) {
        res.status(404).json({ error: "Service not found" });
        return;
      }
      await prisma.businessService.delete({ where: { id: serviceId } });
      res.status(204).end();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service";
      res.status(500).json({ error: message });
    }
  });

  router.get("/:id/availability", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    const dateStr = req.query.date as string | undefined;
    const serviceId = req.query.serviceId as string | undefined;
    const smart = req.query.smart === "1" || req.query.smart === "true";
    if (!dateStr || !serviceId) {
      res.status(400).json({
        error: "Query params date (YYYY-MM-DD) and serviceId required",
      });
      return;
    }
    const date = new Date(dateStr + "T12:00:00.000Z");
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
    try {
      if (smart) {
        const slots = await getSmartSlots(
          prisma,
          businessId,
          dateStr,
          serviceId,
        );
        res.json({ slots });
        return;
      }
      const slots = await getAvailableSlots(
        prisma,
        businessId,
        dateStr,
        serviceId,
      );
      res.json({ slots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  router.get("/:id/occupied-slots", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    const dateStr = req.query.date as string | undefined;
    const serviceId = req.query.serviceId as string | undefined;
    if (!dateStr || !serviceId) {
      res.status(400).json({
        error: "Query params date (YYYY-MM-DD) and serviceId required",
      });
      return;
    }
    const date = new Date(dateStr + "T12:00:00.000Z");
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
    try {
      const slots = await getOccupiedSlots(
        prisma,
        businessId,
        dateStr,
        serviceId,
      );
      res.json({ slots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch occupied slots" });
    }
  });

  router.get("/:id/config", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    try {
      const [config, business] = await Promise.all([
        prisma.gestorConfig.findUnique({ where: { businessId } }),
        prisma.business.findUnique({
          where: { id: businessId },
          select: {
            name: true,
            logoUrl: true,
            email: true,
            phone: true,
            address: true,
            professionId: true,
            taxId: true,
            businessAddress: true,
            businessPopulation: true,
            isCanarias: true,
            description: true,
            publicPhoneNumber: true,
            slug: true,
            socialLinks: true,
          },
        }),
      ]);
      if (!config) {
        res.status(404).json({ error: "Config not found" });
        return;
      }
      res.json({
        ...config,
        companyName: business?.name ?? "",
        logoUrl: business?.logoUrl ?? null,
        email: business?.email ?? null,
        phone: business?.phone ?? null,
        address: business?.address ?? null,
        professionId: business?.professionId ?? null,
        taxId: business?.taxId ?? null,
        businessAddress: business?.businessAddress ?? null,
        businessPopulation: business?.businessPopulation ?? null,
        isCanarias: business?.isCanarias ?? false,
        description: business?.description ?? null,
        publicPhoneNumber: business?.publicPhoneNumber ?? null,
        slug: business?.slug ?? null,
        socialLinks: business?.socialLinks ?? null,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[businesses/:id/config GET]", msg);
      res.status(500).json({ error: msg });
    }
  });

  // Fields that belong to Business identity (not GestorConfig)
  const BUSINESS_IDENTITY_KEYS = new Set([
    "logoUrl", "email", "phone", "address", "professionId",
    "taxId", "businessAddress", "businessPopulation", "isCanarias",
    "description", "publicPhoneNumber", "slug", "socialLinks",
  ]);

  const CONFIG_UPDATE_KEYS = [
    // GestorConfig operational fields
    "numberOfPeople",
    "onboardingComplete",
    // Features
    "defaultVatPercent",
    "cartEnabled",
    "whatsappRemindersEnabled",
    "whatsappPhoneNumberId",
    "bonosEnabled",
    "serviciosEnabled",
    "inventarioEnabled",
    "hiddenSystemServiceNames",
    "locale",
    // Theme & UI
    "sameColorsForAll",
    "agendaBg",
    "markedDaysColor",
    "vacationColor",
    "perAgendaColors",
    "themeId",
    "colorMode",
    "customColors",
    "titleTextOverrides",
    "moduleIcons",
    // Scheduler
    "startHour",
    "endHour",
    "pixelsPerHour",
    "slotDurationMinutes",
    "workDaysPerWeek",
    "maxPeoplePerSlot",
    "defaultView",
    "weekStart",
    "agendaListConfig",
    // Layout
    "sidebarPosition",
    "showNavbar",
    "calendarAppearance",
    "sidebarModuleIds",
    "dashboardModuleIds",
    "smartFillingEnabled",
    "smartFillingDiscountPercent",
    // Public booking
    "bookingEnabled",
    "depositPercent",
    "depositRequired",
  ] as const;

  router.put("/:id/config", async (req: Request, res: Response) => {
    const businessId = requireValidBusinessId(req, res);
    if (!businessId) return;
    const body = req.body ?? {};

    // Separate incoming fields: Business identity vs GestorConfig operational
    const businessData: Record<string, unknown> = {};
    const gestorConfigData: Record<string, unknown> = {};

    if (typeof body.companyName === "string") {
      businessData.name = body.companyName.trim();
    }

    // Identity fields go to Business
    for (const key of BUSINESS_IDENTITY_KEYS) {
      if (key in body) businessData[key] = body[key];
    }

    // Operational fields go to GestorConfig
    for (const key of CONFIG_UPDATE_KEYS) {
      if (key in body) gestorConfigData[key] = body[key];
    }

    try {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      if (!business) {
        res.status(404).json({ error: "Business not found" });
        return;
      }

      const professionChanging =
        "professionId" in businessData &&
        businessData.professionId !== business.professionId;

      const config = await prisma.$transaction(async (tx) => {
        if (Object.keys(businessData).length > 0) {
          await tx.business.update({
            where: { id: businessId },
            data: businessData,
          });
        }

        const saved = await tx.gestorConfig.upsert({
          where: { businessId },
          update: gestorConfigData,
          create: { ...gestorConfigData, businessId },
        });

        if (professionChanging) {
          await tx.businessCategory.deleteMany({
            where: { businessId, businessServices: { none: {} } },
          });
          await tx.gestorConfig.update({
            where: { businessId },
            data: { hiddenSystemServiceNames: [] },
          });
        }

        return saved;
      });

      const updatedBusiness = await prisma.business.findUnique({ where: { id: businessId } });
      res.json({
        ...config,
        companyName: updatedBusiness?.name ?? business.name,
        logoUrl: updatedBusiness?.logoUrl ?? null,
        email: updatedBusiness?.email ?? null,
        phone: updatedBusiness?.phone ?? null,
        address: updatedBusiness?.address ?? null,
        professionId: updatedBusiness?.professionId ?? null,
        taxId: updatedBusiness?.taxId ?? null,
        businessAddress: updatedBusiness?.businessAddress ?? null,
        businessPopulation: updatedBusiness?.businessPopulation ?? null,
        isCanarias: updatedBusiness?.isCanarias ?? false,
        description: updatedBusiness?.description ?? null,
        publicPhoneNumber: updatedBusiness?.publicPhoneNumber ?? null,
        slug: updatedBusiness?.slug ?? null,
        socialLinks: updatedBusiness?.socialLinks ?? null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update config";
      console.error("Error updating config:", error);
      res.status(500).json({ error: message });
    }
  });

  return router;
};

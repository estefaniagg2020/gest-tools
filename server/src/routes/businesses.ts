import { Router, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  getAvailableSlots,
  getSmartSlots,
  getOccupiedSlots,
} from "../services/availability.js";

export const businessRouter = (prisma: PrismaClient) => {
  const router = Router();

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

  const buildServiceCatalog = async (businessId: string) => {
    const config = await prisma.gestorConfig.findUnique({ where: { businessId } });
    const professionId = config?.professionId ?? "";
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
      prisma.service.findMany({
        where: { businessId },
        orderBy: { name: "asc" },
        include: { serviceCategory: { select: { id: true, label: true, icon: true } } },
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
      const catId = svc.categoryId ?? `user-${svc.id}`;
      const catLabel = svc.serviceCategory?.label ?? svc.category ?? "Sin categoría";
      const catIcon = svc.serviceCategory?.icon ?? "📋";
      if (!catalogMap.has(catId)) {
        catalogMap.set(catId, { id: catId, label: catLabel, icon: catIcon, isSystem: false, services: [] });
      }
      catalogMap.get(catId)!.services.push({
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
    const businessId = getId(req);
    try {
      const catalog = await buildServiceCatalog(businessId);
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service catalog" });
    }
  });

  router.get("/:id/services", async (req: Request, res: Response) => {
    const businessId = getId(req);
    try {
      const catalog = await buildServiceCatalog(businessId);
      const flat = catalog.flatMap((cat) =>
        cat.services.map((s) => ({
          ...s,
          category: cat.label,
          categoryId: cat.id,
          serviceCategory: { id: cat.id, label: cat.label, icon: cat.icon },
        })),
      );
      res.json(flat);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  router.post("/:id/services", async (req: Request, res: Response) => {
    const businessId = getId(req);
    const { name, category, duration, price, description, categoryId } = req.body ?? {};
    if (!name || !duration) {
      res.status(400).json({ error: "name and duration are required" });
      return;
    }
    try {
      const service = await prisma.service.create({
        data: {
          businessId,
          name,
          category: category ?? "",
          duration: Number(duration),
          price: price != null ? Number(price) : 0,
          description: description ?? null,
          categoryId: categoryId ?? null,
        },
        include: { serviceCategory: { select: { id: true, label: true, icon: true } } },
      });
      res.status(201).json({
        id: service.id,
        name: service.name,
        category: service.serviceCategory?.label ?? service.category,
        categoryId: service.categoryId,
        duration: service.duration,
        price: service.price,
        description: service.description,
        serviceCategory: service.serviceCategory ?? null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create service";
      res.status(500).json({ error: message });
    }
  });

  router.put("/:id/services/:serviceId", async (req: Request, res: Response) => {
    const businessId = getId(req);
    const serviceId = req.params.serviceId as string;
    const { name, category, duration, price, description, categoryId } = req.body ?? {};
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
        const created = await prisma.service.create({
          data: {
            businessId,
            name: name ?? systemSvc.name,
            category: category ?? systemSvc.category.label,
            duration: duration != null ? Number(duration) : systemSvc.duration,
            price: price != null ? Number(price) : systemSvc.price,
            description: description ?? systemSvc.description ?? null,
            categoryId: categoryId ?? null,
          },
          include: { serviceCategory: { select: { id: true, label: true, icon: true } } },
        });
        res.json({
          id: created.id,
          name: created.name,
          category: created.serviceCategory?.label ?? created.category,
          categoryId: created.categoryId,
          duration: created.duration,
          price: created.price,
          description: created.description,
          isSystemService: false,
          serviceCategory: created.serviceCategory ?? null,
        });
        return;
      }

      const existing = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
      if (!existing) {
        res.status(404).json({ error: "Service not found" });
        return;
      }
      const updated = await prisma.service.update({
        where: { id: serviceId },
        data: {
          ...(name !== undefined && { name }),
          ...(category !== undefined && { category }),
          ...(duration !== undefined && { duration: Number(duration) }),
          ...(price !== undefined && { price: Number(price) }),
          ...(description !== undefined && { description }),
          ...(categoryId !== undefined && { categoryId }),
        },
        include: { serviceCategory: { select: { id: true, label: true, icon: true } } },
      });
      res.json({
        id: updated.id,
        name: updated.name,
        category: updated.serviceCategory?.label ?? updated.category,
        categoryId: updated.categoryId,
        duration: updated.duration,
        price: updated.price,
        description: updated.description,
        isSystemService: false,
        serviceCategory: updated.serviceCategory ?? null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update service";
      res.status(500).json({ error: message });
    }
  });

  router.delete("/:id/services/:serviceId", async (req: Request, res: Response) => {
    const businessId = getId(req);
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

      const existing = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
      if (!existing) {
        res.status(404).json({ error: "Service not found" });
        return;
      }
      await prisma.service.delete({ where: { id: serviceId } });
      res.status(204).end();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service";
      res.status(500).json({ error: message });
    }
  });

  router.get("/:id/availability", async (req: Request, res: Response) => {
    const businessId = getId(req);
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
    const businessId = getId(req);
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
    const businessId = getId(req);
    try {
      const config = await prisma.gestorConfig.findUnique({
        where: { businessId },
      });
      res.json(config);
    } catch (error) {
      res.status(404).json({ error: "Config not found" });
    }
  });

  const CONFIG_UPDATE_KEYS = [
    "professionId",
    "defaultVatPercent",
    "cartEnabled",
    "whatsappRemindersEnabled",
    "whatsappPhoneNumberId",
    "bonosEnabled",
    "serviciosEnabled",
    "inventarioEnabled",
    "hiddenSystemServiceNames",
  ] as const;

  router.put("/:id/config", async (req: Request, res: Response) => {
    const businessId = getId(req);
    const body = req.body ?? {};
    const configData: Record<string, unknown> = {};
    for (const key of CONFIG_UPDATE_KEYS) {
      if (key in body) configData[key] = body[key];
    }
    try {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      if (!business) {
        res.status(404).json({ error: "Business not found" });
        return;
      }

      const currentConfig = await prisma.gestorConfig.findUnique({ where: { businessId } });
      const professionChanging =
        "professionId" in configData &&
        configData.professionId !== currentConfig?.professionId;

      const config = await prisma.gestorConfig.upsert({
        where: { businessId },
        update: configData,
        create: { ...configData, businessId },
      });

      if (professionChanging) {
        await prisma.serviceCategory.deleteMany({
          where: {
            businessId,
            services: { none: {} },
          },
        });
        await prisma.gestorConfig.update({
          where: { businessId },
          data: { hiddenSystemServiceNames: [] },
        });
      }

      res.json(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update config";
      console.error("Error updating config:", error);
      res.status(500).json({ error: message });
    }
  });

  return router;
};

import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import type { PrismaClient } from "@prisma/client";
import { discoverProfessionWithAI } from "../services/aiProfessionDiscovery.js";

const discoverRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Puedes hacer hasta 5 búsquedas con IA cada 10 minutos." },
});

export const professionsRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      const professions = await prisma.profession.findMany({
        orderBy: { label: "asc" },
        include: {
          categories: {
            orderBy: { label: "asc" },
            include: { services: { orderBy: { name: "asc" } } },
          },
        },
      });
      res.json(professions);
    } catch {
      res.status(500).json({ error: "Error al cargar profesiones" });
    }
  });

  router.get("/search", async (req: Request, res: Response) => {
    const raw = ((req.query.q as string) ?? "").trim();

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "");

    const trigrams = (s: string): Set<string> => {
      const set = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
      for (let i = 0; i < s.length - 2; i++) set.add(s.slice(i, i + 3));
      return set;
    };

    const similarity = (a: string, b: string): number => {
      if (b.includes(a)) return 1;
      const ta = trigrams(a);
      const tb = trigrams(b);
      if (ta.size === 0) return 0;
      let hits = 0;
      ta.forEach((t) => { if (tb.has(t)) hits++; });
      return hits / ta.size;
    };

    const q = normalize(raw);

    try {
      const all = await prisma.profession.findMany({ orderBy: { label: "asc" } });
      if (!q || q.length < 2) {
        res.json(all.slice(0, 20));
        return;
      }

      const scored = all
        .map((p) => {
          const norm = normalize(p.label) + " " + normalize(p.id);
          const score = similarity(q, norm);
          return { p, score };
        })
        .filter(({ score }) => score >= 0.3)
        .sort((a, b) => b.score - a.score);

      res.json(scored.slice(0, 20).map(({ p }) => p));
    } catch {
      res.status(500).json({ error: "Error al buscar profesiones" });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const profession = await prisma.profession.findUnique({
        where: { id: req.params.id },
        include: {
          categories: {
            orderBy: { label: "asc" },
            include: { services: { orderBy: { name: "asc" } } },
          },
        },
      });
      if (!profession) {
        res.status(404).json({ error: "Profesión no encontrada" });
        return;
      }
      res.json(profession);
    } catch {
      res.status(500).json({ error: "Error al cargar la profesión" });
    }
  });

  router.post("/discover", discoverRateLimit, async (req: Request, res: Response) => {
    const professionName = ((req.body?.professionName as string) ?? "").trim();
    if (!professionName || professionName.length < 2) {
      res.status(400).json({ error: "Se necesita un nombre de profesión" });
      return;
    }

    try {
      const existing = await prisma.profession.findFirst({
        where: {
          OR: [
            { label: { equals: professionName, mode: "insensitive" } },
            { id: { equals: professionName.toLowerCase().replace(/\s+/g, "-") } },
          ],
        },
        include: {
          categories: {
            include: { services: { orderBy: { name: "asc" } } },
          },
        },
      });

      if (existing) {
        res.json({ source: "database", profession: existing });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "IA no configurada. Añade GEMINI_API_KEY al servidor." });
        return;
      }

      const discovery = await discoverProfessionWithAI(professionName);

      if (!discovery.valid) {
        res.json({ source: "ai", valid: false, reason: discovery.reason });
        return;
      }

      const alreadyExists = await prisma.profession.findUnique({
        where: { id: discovery.professionId },
      });

      if (alreadyExists) {
        const full = await prisma.profession.findUnique({
          where: { id: discovery.professionId },
          include: {
            categories: {
              include: { services: { orderBy: { name: "asc" } } },
            },
          },
        });
        res.json({ source: "database", profession: full });
        return;
      }

      const saved = await prisma.profession.create({
        data: {
          id: discovery.professionId,
          label: discovery.professionLabel,
          categories: {
            create: discovery.categories.map((cat) => ({
              id: cat.id,
              label: cat.label,
              icon: cat.icon,
              services: {
                create: cat.services.map((svc) => ({
                  id: svc.id,
                  name: svc.name,
                  duration: svc.duration,
                  price: svc.price,
                  description: svc.description ?? null,
                })),
              },
            })),
          },
        },
        include: {
          categories: {
            include: { services: { orderBy: { name: "asc" } } },
          },
        },
      });

      res.status(201).json({ source: "ai", valid: true, profession: saved });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      res.status(500).json({ error: message });
    }
  });

  return router;
};

import { Router, Request, Response } from "express";
import { parseSlotQueryWithAI } from "../services/aiSlotParser.js";

export const aiRouter = (): Router => {
  const router = Router();

  router.post("/parse-slot-query", async (req: Request, res: Response) => {
    const { text } = req.body as { text?: string };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      res.status(400).json({ error: "El campo 'text' es requerido" });
      return;
    }

    if (text.length > 500) {
      res.status(400).json({ error: "El texto no puede superar los 500 caracteres" });
      return;
    }

    try {
      const result = await parseSlotQueryWithAI(text.trim());
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al procesar la consulta";
      res.status(500).json({ error: message });
    }
  });

  return router;
};

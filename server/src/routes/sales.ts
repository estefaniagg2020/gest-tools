import { Router, Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/index.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

export const salesRouter = (prisma: PrismaClient) => {
  const router = Router();
  const auth = requireAuth(prisma);

  const getId = (req: Request) =>
    Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id ?? "");

  // ─── GET / — List sales for a business ────────────────────────────────────
  router.get("/", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    try {
      const sales = await (prisma as any).sale.findMany({
        where: { businessId: req.user.businessId },
        include: {
          client: { select: { id: true, name: true } },
          appointment: { select: { id: true, start: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  // ─── GET /:id — Get a single sale with items ──────────────────────────────
  router.get("/:id", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const id = getId(req);
    try {
      const sale = await (prisma as any).sale.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          appointment: { select: { id: true, start: true, end: true } },
          items: true,
        },
      });
      if (!sale || sale.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Venta no encontrada" });
        return;
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale" });
    }
  });

  // ─── POST / — Create a new open sale (ticket) ────────────────────────────
  router.post("/", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const { clientId, appointmentId, notes } = req.body ?? {};
    try {
      // Prevent duplicate ticket for same appointment
      if (appointmentId) {
        const existing = await (prisma as any).sale.findUnique({
          where: { appointmentId },
        });
        if (existing) {
          res.status(409).json({ error: "Esta cita ya tiene un ticket asociado", saleId: existing.id });
          return;
        }
      }

      const sale = await (prisma as any).sale.create({
        data: {
          businessId: req.user.businessId,
          clientId: clientId ?? null,
          appointmentId: appointmentId ?? null,
          notes: notes ?? null,
          status: "open",
        },
        include: { items: true },
      });
      res.status(201).json(sale);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create sale";
      res.status(500).json({ error: message });
    }
  });

  // ─── POST /:id/items — Add an item line to an open sale ───────────────────
  router.post("/:id/items", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const saleId = getId(req);
    const { type, serviceId, productId, name, unitPrice, quantity, discount, clientBonoId } = req.body ?? {};

    if (!type || !name || unitPrice == null) {
      res.status(400).json({ error: "type, name y unitPrice son requeridos" });
      return;
    }
    if (!["service", "product"].includes(type)) {
      res.status(400).json({ error: "type debe ser 'service' o 'product'" });
      return;
    }

    try {
      const sale = await (prisma as any).sale.findUnique({ where: { id: saleId } });
      if (!sale || sale.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Venta no encontrada" });
        return;
      }
      if (sale.status !== "open") {
        res.status(400).json({ error: "No se pueden añadir items a un ticket cerrado" });
        return;
      }

      const qty = Number(quantity ?? 1);
      const disc = Number(discount ?? 0);
      const price = Number(unitPrice);
      const lineTotal = price * qty * (1 - disc / 100);

      const item = await (prisma as any).saleItem.create({
        data: {
          saleId,
          type,
          serviceId: serviceId ?? null,
          productId: productId ?? null,
          name,
          unitPrice: price,
          quantity: qty,
          discount: disc,
          lineTotal,
          clientBonoId: clientBonoId ?? null,
        },
      });

      // Recalculate sale totals
      const allItems = await (prisma as any).saleItem.findMany({ where: { saleId } });
      const subtotal = allItems.reduce((sum: number, i: any) => sum + i.lineTotal, 0);
      await (prisma as any).sale.update({
        where: { id: saleId },
        data: { subtotal, total: subtotal },
      });

      res.status(201).json(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add item";
      res.status(500).json({ error: message });
    }
  });

  // ─── DELETE /:id/items/:itemId — Remove an item from open sale ────────────
  router.delete("/:id/items/:itemId", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const saleId = getId(req);
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : (req.params.itemId ?? "");

    try {
      const sale = await (prisma as any).sale.findUnique({ where: { id: saleId } });
      if (!sale || sale.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Venta no encontrada" });
        return;
      }
      if (sale.status !== "open") {
        res.status(400).json({ error: "No se pueden eliminar items de un ticket cerrado" });
        return;
      }

      await (prisma as any).saleItem.delete({ where: { id: itemId } });

      // Recalculate totals
      const remaining = await (prisma as any).saleItem.findMany({ where: { saleId } });
      const subtotal = remaining.reduce((sum: number, i: any) => sum + i.lineTotal, 0);
      await (prisma as any).sale.update({
        where: { id: saleId },
        data: { subtotal, total: subtotal },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item" });
    }
  });

  // ─── POST /:id/pay — Pay a sale (close the ticket) ────────────────────────
  /**
   * Body: { paymentMethod, discountAmount?, taxAmount?, notes? }
   * 
   * This endpoint:
   * 1. Marks the Sale as "paid"
   * 2. Decrements stock for each product SaleItem
   * 3. Creates StockMovement records for audit
   * 4. Updates Appointment.status = "completed" & paymentStatus = "paid"
   * 5. Updates ClientBono sessions for any bono-paid items
   */
  router.post("/:id/pay", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const id = getId(req);
    const {
      paymentMethod = "cash",
      discountAmount = 0,
      taxAmount = 0,
      notes,
    } = req.body ?? {};

    try {
      const sale: any = await (prisma as any).sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale || sale.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Venta no encontrada" });
        return;
      }
      if (sale.status !== "open") {
        res.status(400).json({ error: "Esta venta ya está cerrada" });
        return;
      }

      const disc = Number(discountAmount);
      const tax = Number(taxAmount);
      const total = (sale.subtotal - disc) + tax;

      // Run everything in a transaction
      await (prisma as any).$transaction(async (tx: any) => {
        // 1. Close the Sale
        await tx.sale.update({
          where: { id },
          data: {
            status: "paid",
            paymentMethod,
            discountAmount: disc,
            taxAmount: tax,
            total,
            notes: notes ?? sale.notes,
          },
        });

        // 2. For each product item: decrement stock + create StockMovement
        for (const item of sale.items) {
          if (item.type === "product" && item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockLevel: { decrement: item.quantity } },
            });
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: -item.quantity,
                type: "SALE",
                reason: `Venta #${id}`,
              },
            });
          }

          // 3. Update bono session if paid with bono
          if (item.clientBonoId) {
            await tx.clientBono.update({
              where: { id: item.clientBonoId },
              data: {
                sessionsUsed: { increment: 1 },
                remainingSessions: { decrement: 1 },
              },
            });
          }
        }

        // 4. Update appointment status if linked
        if (sale.appointmentId) {
          await tx.appointment.update({
            where: { id: sale.appointmentId },
            data: { status: "completed", paymentStatus: "paid" },
          });
        }
      });

      const updated = await (prisma as any).sale.findUnique({
        where: { id },
        include: { items: true, client: true, appointment: true },
      });
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process payment";
      res.status(500).json({ error: message });
    }
  });

  // ─── POST /:id/void — Void/cancel an open sale ────────────────────────────
  router.post("/:id/void", auth, requireStaff, async (req: Request, res: Response) => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Negocio no asociado" });
      return;
    }
    const id = getId(req);
    try {
      const sale = await (prisma as any).sale.findUnique({ where: { id } });
      if (!sale || sale.businessId !== req.user.businessId) {
        res.status(404).json({ error: "Venta no encontrada" });
        return;
      }
      if (!["open", "paid"].includes(sale.status)) {
        res.status(400).json({ error: "La venta ya está anulada" });
        return;
      }
      const updated = await (prisma as any).sale.update({
        where: { id },
        data: { status: "voided" },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to void sale" });
    }
  });

  return router;
};

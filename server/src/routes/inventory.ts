import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const inventoryRouter = (prisma: PrismaClient) => {
  const router = Router();

  // --- PRODUCTS ---

  // Get all products for a business
  router.get("/", async (req: Request, res: Response) => {
    const { businessId } = req.query;
    if (!businessId) {
      res.status(400).json({ error: "Missing businessId" });
      return;
    }

    try {
      const products = await prisma.product.findMany({
        where: { businessId: String(businessId) },
        include: { supplier: true },
        orderBy: { name: "asc" },
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create a product
  router.post("/", async (req: Request, res: Response) => {
    const {
      businessId,
      name,
      sku,
      barcode,
      description,
      price,
      cost,
      stockLevel,
      minStockLevel,
      supplierId,
      isService,
    } = req.body;

    if (!businessId || !name) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      const product = await prisma.product.create({
        data: {
          businessId,
          name,
          sku,
          barcode,
          description,
          price: Number(price || 0),
          cost: Number(cost || 0),
          stockLevel: Number(stockLevel || 0),
          minStockLevel: Number(minStockLevel || 5),
          supplierId,
          isService: Boolean(isService),
          // Create initial stock movement if stock > 0
          movements: Number(stockLevel) > 0 ? {
            create: {
              quantity: Number(stockLevel),
              type: "ADJUSTMENT",
              reason: "Initial Stock",
            }
          } : undefined
        },
      });
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update a product
  router.put("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    // Remove immutable fields or fields handled separately
    delete data.id;
    delete data.businessId;
    delete data.stockLevel; // Stock should be updated via adjustments

    try {
      const product = await prisma.product.update({
        where: { id: id as string },
        data: {
          ...data,
          price: data.price ? Number(data.price) : undefined,
          cost: data.cost ? Number(data.cost) : undefined,
          minStockLevel: data.minStockLevel ? Number(data.minStockLevel) : undefined,
        },
      });
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete a product
  router.delete("/:id", async (req: Request, res: Response) => {
      const { id } = req.params;
      try {
          await prisma.product.delete({
              where: { id: id as string }
          });
          res.json({ success: true });
      } catch (error) {
          console.error("Error deleting product:", error);
          res.status(500).json({ error: "Internal server error" });
      }
  });


  // --- STOCK MOVEMENTS ---

  // Adjust stock
  router.post("/:id/adjust", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity, type, reason } = req.body;

    if (!quantity || !type) {
      res.status(400).json({ error: "Missing quantity or type" });
      return;
    }

    try {
      // Transaction to ensure atomic update
      const [movement, updatedProduct] = await prisma.$transaction([
        prisma.stockMovement.create({
          data: {
            productId: id as string,
            quantity: Number(quantity),
            type,
            reason,
          },
        }),
        prisma.product.update({
          where: { id: id as string },
          data: {
            stockLevel: {
              increment: Number(quantity),
            },
          },
        }),
      ]);

      res.json({ movement, newStockLevel: updatedProduct.stockLevel });
    } catch (error) {
      console.error("Error adjusting stock:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
    // Get movements for a product
    router.get("/:id/movements", async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const movements = await prisma.stockMovement.findMany({
                where: { productId: id as string },
                orderBy: { createdAt: "desc" },
                take: 50 // Limit to last 50 movements
            });
            res.json(movements);
        } catch (error) {
            console.error("Error fetching movements:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });


  // --- SUPPLIERS ---

  router.get("/suppliers", async (req: Request, res: Response) => {
      const { businessId } = req.query;
       if (!businessId) {
        res.status(400).json({ error: "Missing businessId" });
        return;
      }
      try {
          const suppliers = await prisma.supplier.findMany({
               where: { businessId: String(businessId) },
               orderBy: { name: "asc" }
          });
          res.json(suppliers);
      } catch (error) {
          res.status(500).json({ error: "Internal server error" });
      }
  });

  router.post("/suppliers", async (req: Request, res: Response) => {
      const { businessId, name, email, phone, contactPerson } = req.body;
      try {
          const supplier = await prisma.supplier.create({
              data: { businessId, name, email, phone, contactPerson }
          });
          res.json(supplier);
      } catch (error) {
          res.status(500).json({ error: "Internal server error" });
      }
  });

  return router;
};

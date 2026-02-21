import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { inventoryRouter } from "../routes/inventory.js";

const BIZ = "biz-1";
const fakeProduct = {
  id: "prod-1",
  businessId: BIZ,
  name: "Champú Premium",
  sku: "SKU-001",
  barcode: null,
  description: null,
  price: 12.5,
  cost: 5,
  stockLevel: 20,
  minStockLevel: 5,
  supplierId: null,
  isService: false,
  supplier: null,
};
const fakeMovement = {
  id: "mov-1",
  productId: "prod-1",
  quantity: 10,
  type: "ADJUSTMENT",
  reason: "Initial Stock",
  createdAt: new Date(),
};
const fakeSupplier = { id: "sup-1", businessId: BIZ, name: "Distribuciones SA", email: null, phone: null, contactPerson: null };

describe("Inventory routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      product: {
        findMany: vi.fn().mockResolvedValue([fakeProduct]),
        create: vi.fn().mockResolvedValue({ ...fakeProduct, id: "prod-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeProduct, price: 15 }),
        delete: vi.fn().mockResolvedValue(fakeProduct),
      },
      stockMovement: {
        findMany: vi.fn().mockResolvedValue([fakeMovement]),
        create: vi.fn().mockResolvedValue({ ...fakeMovement, id: "mov-new" }),
      },
      supplier: {
        findMany: vi.fn().mockResolvedValue([fakeSupplier]),
        create: vi.fn().mockResolvedValue({ ...fakeSupplier, id: "sup-new" }),
      },
    });
    app = withAuth(inventoryRouter(prisma));
  });

  it("should_return_product_list_when_businessId_provided", async () => {
    const res = await request(app).get("/").query({ businessId: BIZ });
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Champú Premium");
  });

  it("should_return_400_when_businessId_missing_on_GET", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(400);
  });

  it("should_create_product_when_POST_with_required_fields", async () => {
    const res = await request(app).post("/").send({ businessId: BIZ, name: "Gel Fijador", stockLevel: 10 });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("prod-new");
  });

  it("should_return_400_when_POST_missing_businessId_or_name", async () => {
    const res = await request(app).post("/").send({ businessId: BIZ });
    expect(res.status).toBe(400);
  });

  it("should_update_product_when_PUT_with_id", async () => {
    const res = await request(app).put("/prod-1").send({ price: 15 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(15);
  });

  it("should_delete_product_when_DELETE_with_id", async () => {
    const res = await request(app).delete("/prod-1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should_adjust_stock_and_return_new_level_when_POST_adjust", async () => {
    prisma.product.update = vi.fn().mockResolvedValue({ ...fakeProduct, stockLevel: 25 });
    const res = await request(app).post("/prod-1/adjust").send({ quantity: 5, type: "ADJUSTMENT", reason: "Restock" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("newStockLevel");
  });

  it("should_return_400_when_adjust_missing_quantity_or_type", async () => {
    const res = await request(app).post("/prod-1/adjust").send({ quantity: 5 });
    expect(res.status).toBe(400);
  });

  it("should_return_movement_history_when_GET_movements", async () => {
    const res = await request(app).get("/prod-1/movements");
    expect(res.status).toBe(200);
    expect(res.body[0].type).toBe("ADJUSTMENT");
  });

  it("should_return_supplier_list_when_businessId_provided", async () => {
    const res = await request(app).get("/suppliers").query({ businessId: BIZ });
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Distribuciones SA");
  });

  it("should_return_400_when_GET_suppliers_missing_businessId", async () => {
    const res = await request(app).get("/suppliers");
    expect(res.status).toBe(400);
  });

  it("should_create_supplier_when_POST_suppliers", async () => {
    const res = await request(app).post("/suppliers").send({ businessId: BIZ, name: "Nuevo Proveedor" });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("sup-new");
  });
});

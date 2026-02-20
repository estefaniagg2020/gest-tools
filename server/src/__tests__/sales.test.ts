import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { salesRouter } from "../routes/sales.js";

const BIZ = "biz-1";

const fakeSale = {
  id: "sale-1",
  businessId: BIZ,
  clientId: "cli-1",
  appointmentId: null,
  status: "open",
  subtotal: 0,
  total: 0,
  notes: null,
  paymentMethod: null,
  discountAmount: 0,
  taxAmount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  client: { id: "cli-1", name: "Carmen" },
  appointment: null,
};

const fakeItem = {
  id: "item-1",
  saleId: "sale-1",
  type: "service",
  serviceId: "svc-1",
  productId: null,
  name: "Corte",
  unitPrice: 20,
  quantity: 1,
  discount: 0,
  lineTotal: 20,
  clientBonoId: null,
};

describe("Sales routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      sale: {
        findMany: vi.fn().mockResolvedValue([fakeSale]),
        findUnique: vi.fn().mockResolvedValue({ ...fakeSale, items: [fakeItem] }),
        create: vi.fn().mockResolvedValue({ ...fakeSale, id: "sale-new", items: [] }),
        update: vi.fn().mockResolvedValue({ ...fakeSale, status: "voided" }),
      },
      saleItem: {
        create: vi.fn().mockResolvedValue({ ...fakeItem, id: "item-new" }),
        findMany: vi.fn().mockResolvedValue([fakeItem]),
        delete: vi.fn().mockResolvedValue(fakeItem),
      },
    });
    app = withAuth(salesRouter(prisma));
  });

  it("should_return_sale_list_when_GET_slash", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe("sale-1");
  });

  it("should_return_single_sale_when_GET_id", async () => {
    const res = await request(app).get("/sale-1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("sale-1");
  });

  it("should_return_404_when_sale_belongs_to_another_business", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue({ ...fakeSale, businessId: "other-biz" });
    const res = await request(app).get("/sale-1");
    expect(res.status).toBe(404);
  });

  it("should_create_sale_when_POST_slash", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).post("/").send({ clientId: "cli-1" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("sale-new");
  });

  it("should_return_409_when_appointment_already_has_a_sale", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue({ id: "existing-sale", appointmentId: "apt-1" });
    const res = await request(app).post("/").send({ appointmentId: "apt-1" });
    expect(res.status).toBe(409);
    expect(res.body.saleId).toBe("existing-sale");
  });

  it("should_add_item_to_open_sale_when_POST_id_items", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue(fakeSale);
    const res = await request(app).post("/sale-1/items").send({
      type: "service", name: "Corte", unitPrice: 20, serviceId: "svc-1",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("item-new");
  });

  it("should_return_400_when_POST_items_missing_required_fields", async () => {
    const res = await request(app).post("/sale-1/items").send({ type: "service" });
    expect(res.status).toBe(400);
  });

  it("should_return_400_when_POST_items_type_is_invalid", async () => {
    const res = await request(app).post("/sale-1/items").send({ type: "gift", name: "X", unitPrice: 10 });
    expect(res.status).toBe(400);
  });

  it("should_return_400_when_adding_item_to_closed_sale", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue({ ...fakeSale, status: "paid" });
    const res = await request(app).post("/sale-1/items").send({ type: "service", name: "X", unitPrice: 10 });
    expect(res.status).toBe(400);
  });

  it("should_remove_item_and_recalculate_total_when_DELETE_id_items_itemId", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue(fakeSale);
    prisma.saleItem.findMany = vi.fn().mockResolvedValue([]);
    const res = await request(app).delete("/sale-1/items/item-1");
    expect(res.status).toBe(204);
    expect(prisma.saleItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });

  it("should_return_400_when_deleting_item_from_closed_sale", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue({ ...fakeSale, status: "paid" });
    const res = await request(app).delete("/sale-1/items/item-1");
    expect(res.status).toBe(400);
  });

  it("should_close_sale_and_return_paid_status_when_POST_id_pay", async () => {
    const paidSale = { ...fakeSale, status: "paid", items: [fakeItem] };
    prisma.sale.findUnique = vi.fn()
      .mockResolvedValueOnce({ ...fakeSale, items: [fakeItem], subtotal: 20 })
      .mockResolvedValueOnce(paidSale);
    prisma.sale.update = vi.fn().mockResolvedValue(paidSale);
    const res = await request(app).post("/sale-1/pay").send({ paymentMethod: "card" });
    expect(res.status).toBe(200);
  });

  it("should_return_400_when_paying_already_closed_sale", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue({ ...fakeSale, status: "paid", items: [] });
    const res = await request(app).post("/sale-1/pay").send({});
    expect(res.status).toBe(400);
  });

  it("should_void_sale_when_POST_id_void", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue(fakeSale);
    prisma.sale.update = vi.fn().mockResolvedValue({ ...fakeSale, status: "voided" });
    const res = await request(app).post("/sale-1/void");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("voided");
  });

  it("should_return_400_when_voiding_already_voided_sale", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue({ ...fakeSale, status: "voided" });
    const res = await request(app).post("/sale-1/void");
    expect(res.status).toBe(400);
  });

  it("should_return_404_when_sale_not_found_on_void", async () => {
    prisma.sale.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).post("/sale-999/void");
    expect(res.status).toBe(404);
  });
});

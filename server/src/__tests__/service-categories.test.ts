import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { serviceCategoriesRouter } from "../routes/service-categories.js";

const BIZ = "biz-1";
const fakeCat = {
  id: "cat-1", businessId: BIZ, label: "Masajes", icon: "💆",
  createdAt: new Date(), updatedAt: new Date(),
};

describe("Service Categories CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      serviceCategory: {
        findMany: vi.fn().mockResolvedValue([fakeCat]),
        findUnique: vi.fn().mockResolvedValue(fakeCat),
        create: vi.fn().mockResolvedValue({ ...fakeCat, id: "cat-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeCat, label: "Relajación" }),
        delete: vi.fn().mockResolvedValue(fakeCat),
      },
    });
    app = withAuth(serviceCategoriesRouter(prisma));
  });

  it("GET / returns category list", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body[0].label).toBe("Masajes");
  });

  it("POST / creates a category", async () => {
    const res = await request(app).post("/").send({ label: "Facial", icon: "🧖" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("cat-new");
  });

  it("POST / returns 400 when label is missing", async () => {
    const res = await request(app).post("/").send({ icon: "🧖" });
    expect(res.status).toBe(400);
  });

  it("PUT /:id updates label", async () => {
    const res = await request(app).put("/cat-1").send({ label: "Relajación" });
    expect(res.status).toBe(200);
    expect(res.body.label).toBe("Relajación");
  });

  it("PUT /:id returns 404 when not found", async () => {
    prisma.businessCategory.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/cat-999").send({ label: "X" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:id deletes a category", async () => {
    const res = await request(app).delete("/cat-1");
    expect(res.status).toBe(204);
  });

  it("DELETE /:id returns 404 when not found", async () => {
    prisma.businessCategory.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete("/cat-999");
    expect(res.status).toBe(404);
  });
});

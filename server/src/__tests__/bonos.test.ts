import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { bonosRouter } from "../routes/bonos.js";

const BIZ = "biz-1";
const fakeBonoDef = {
  id: "tmpl-1", businessId: BIZ, name: "Pack 10 sesiones",
  type: "session_pack", sessions: 10, price: 90, validDays: 365, serviceId: null,
  loyaltyTriggerEvery: null, loyaltyRewardSessions: null,
  createdAt: new Date(), updatedAt: new Date(),
};
const fakeClientBono = {
  id: "bono-1", clientId: "cli-1", bonoId: "tmpl-1",
  sessionsUsed: 2, sessionsTotal: 10, remainingSessions: 8,
  paidCount: 0, freeSessionsRemaining: null,
  assignedAt: new Date(), expiresAt: null, createdAt: new Date(), updatedAt: new Date(),
};

describe("Bonos CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      bono: {
        findMany: vi.fn().mockResolvedValue([fakeBonoDef]),
        findUnique: vi.fn().mockResolvedValue(fakeBonoDef),
        create: vi.fn().mockResolvedValue({ ...fakeBonoDef, id: "tmpl-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeBonoDef, price: 80 }),
        delete: vi.fn().mockResolvedValue(fakeBonoDef),
      },
      clientBono: {
        findMany: vi.fn().mockResolvedValue([fakeClientBono]),
        findUnique: vi.fn().mockResolvedValue({ ...fakeClientBono, client: { businessId: BIZ } }),
        create: vi.fn().mockResolvedValue({ ...fakeClientBono, id: "bono-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeClientBono, sessionsUsed: 3, remainingSessions: 7 }),
        delete: vi.fn().mockResolvedValue(fakeClientBono),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      client: {
        findUnique: vi.fn().mockResolvedValue({ id: "cli-1", businessId: BIZ }),
      },
      business: {
        findUnique: vi.fn().mockResolvedValue({ id: BIZ }),
      },
    });
    app = withAuth(bonosRouter(prisma));
  });

  // Bono CRUD tests
  it("GET /templates returns bono list", async () => {
    const res = await request(app).get("/templates");
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Pack 10 sesiones");
  });

  it("POST /templates creates a template", async () => {
    const res = await request(app).post("/templates").send({ name: "Pack 5", type: "pack", sessions: 5 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("tmpl-new");
  });

  it("POST /templates returns 400 when name or type missing", async () => {
    const res = await request(app).post("/templates").send({ name: "X" });
    expect(res.status).toBe(400);
  });

  it("PUT /templates/:id updates price", async () => {
    const res = await request(app).put("/templates/tmpl-1").send({ price: 80 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(80);
  });

  it("PUT /templates/:id returns 404 when not found", async () => {
    prisma.bono.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/templates/x").send({ price: 80 });
    expect(res.status).toBe(404);
  });

  it("DELETE /templates/:id deletes bono and its client bonos", async () => {
    const res = await request(app).delete("/templates/tmpl-1");
    expect(res.status).toBe(204);
    expect(prisma.clientBono.deleteMany).toHaveBeenCalledWith({ where: { bonoId: "tmpl-1" } });
  });

  // ClientBono tests
  it("GET /client-bonos returns bono list", async () => {
    const res = await request(app).get("/client-bonos");
    expect(res.status).toBe(200);
    expect(res.body[0].sessionsTotal).toBe(10);
  });

  it("POST /client-bonos assigns a bono to client", async () => {
    const res = await request(app).post("/client-bonos").send({ clientId: "cli-1", bonoId: "tmpl-1" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("bono-new");
  });

  it("POST /client-bonos returns 400 when clientId or bonoId missing", async () => {
    const res = await request(app).post("/client-bonos").send({ clientId: "cli-1" });
    expect(res.status).toBe(400);
  });

  it("PUT /client-bonos/:id updates sessions used", async () => {
    const res = await request(app).put("/client-bonos/bono-1").send({ sessionsUsed: 3, remainingSessions: 7 });
    expect(res.status).toBe(200);
    expect(res.body.sessionsUsed).toBe(3);
  });

  it("DELETE /client-bonos/:id removes a client bono", async () => {
    const res = await request(app).delete("/client-bonos/bono-1");
    expect(res.status).toBe(204);
  });
});

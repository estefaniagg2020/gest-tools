import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { clientsRouter } from "../routes/clients.js";

const BIZ = "biz-1";
const fakeClient = {
  id: "cli-1", businessId: BIZ, name: "Carmen López",
  email: "carmen@test.com", phone: "666123456", notes: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe("Clients CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      client: {
        findMany: vi.fn().mockResolvedValue([fakeClient]),
        findUnique: vi.fn().mockResolvedValue(fakeClient),
        create: vi.fn().mockResolvedValue({ ...fakeClient, id: "cli-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeClient, phone: "000000000" }),
        delete: vi.fn().mockResolvedValue(fakeClient),
      },
    });
    app = withAuth(clientsRouter(prisma));
  });

  it("GET / returns client list", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Carmen López");
  });

  it("POST / creates a client", async () => {
    const res = await request(app).post("/").send({ name: "Pedro", email: "pedro@x.com" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("cli-new");
  });

  it("POST / returns 400 when name is missing", async () => {
    const res = await request(app).post("/").send({ email: "x@x.com" });
    expect(res.status).toBe(400);
  });

  it("PUT /:id updates client phone", async () => {
    const res = await request(app).put("/cli-1").send({ phone: "000000000" });
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("000000000");
  });

  it("PUT /:id returns 404 when client not found", async () => {
    prisma.client.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/cli-999").send({ name: "X" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:id deletes a client", async () => {
    const res = await request(app).delete("/cli-1");
    expect(res.status).toBe(204);
  });

  it("DELETE /:id returns 404 when not found", async () => {
    prisma.client.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete("/cli-999");
    expect(res.status).toBe(404);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { scheduleBlocksRouter } from "../routes/schedule-blocks.js";

const BIZ = "biz-1";
const start = new Date("2025-06-10T09:00:00Z");
const end = new Date("2025-06-10T11:00:00Z");
const fakeBlock = {
  id: "blk-1", businessId: BIZ, memberId: "emp-1",
  start, end, type: "vacation", title: "Vacaciones",
  description: null, status: "active", serviceId: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe("Schedule Blocks CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      scheduleBlock: {
        findMany: vi.fn().mockResolvedValue([fakeBlock]),
        findUnique: vi.fn().mockResolvedValue(fakeBlock),
        create: vi.fn().mockResolvedValue({ ...fakeBlock, id: "blk-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeBlock, status: "cancelled" }),
        delete: vi.fn().mockResolvedValue(fakeBlock),
      },
    });
    app = withAuth(scheduleBlocksRouter(prisma));
  });

  it("GET / returns block list", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body[0].type).toBe("vacation");
  });

  it("GET / returns ISO string dates", async () => {
    const res = await request(app).get("/");
    expect(typeof res.body[0].start).toBe("string");
  });

  it("POST / creates a block", async () => {
    const res = await request(app).post("/").send({
      memberId: "emp-1", start: start.toISOString(), end: end.toISOString(),
      type: "vacation", title: "Vacaciones",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("blk-new");
  });

  it("POST / returns 400 when required fields missing", async () => {
    const res = await request(app).post("/").send({ memberId: "emp-1" });
    expect(res.status).toBe(400);
  });

  it("PUT /:id cancels a block", async () => {
    const res = await request(app).put("/blk-1").send({ status: "cancelled" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("PUT /:id returns 404 when block not found", async () => {
    prisma.scheduleBlock.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/blk-999").send({ status: "cancelled" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:id deletes a block", async () => {
    const res = await request(app).delete("/blk-1");
    expect(res.status).toBe(204);
  });

  it("DELETE /:id returns 404 when not found", async () => {
    prisma.scheduleBlock.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete("/blk-999");
    expect(res.status).toBe(404);
  });
});

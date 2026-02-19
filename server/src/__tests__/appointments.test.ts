import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { appointmentsRouter } from "../routes/appointments.js";

const BIZ = "biz-1";
const now = new Date("2025-01-15T10:00:00Z");
const end = new Date("2025-01-15T11:00:00Z");
const fakeAppt = {
  id: "apt-1", businessId: BIZ, serviceId: null, userId: null,
  employeeId: "emp-1", clientId: null, clientName: "María",
  start: now, end, status: "pending", paymentStatus: "pending",
  notes: null, cancellationReason: null, isAtHome: false, isVIP: false,
  cartItems: null, discountPercent: null, createdAt: new Date(), updatedAt: new Date(),
};

describe("Appointments CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      appointment: {
        findMany: vi.fn().mockResolvedValue([fakeAppt]),
        findUnique: vi.fn().mockResolvedValue(fakeAppt),
        create: vi.fn().mockResolvedValue({ ...fakeAppt, id: "apt-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeAppt, status: "confirmed" }),
        delete: vi.fn().mockResolvedValue(fakeAppt),
      },
    });
    app = withAuth(appointmentsRouter(prisma));
  });

  it("GET / returns appointment list", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].memberId).toBe("emp-1");
  });

  it("GET / maps employeeId to memberId", async () => {
    const res = await request(app).get("/");
    expect(res.body[0]).toHaveProperty("memberId", "emp-1");
  });

  it("POST / creates an appointment", async () => {
    const res = await request(app).post("/").send({
      start: now.toISOString(), end: end.toISOString(), memberId: "emp-1",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("apt-new");
  });

  it("POST / returns 400 when start/end are missing", async () => {
    const res = await request(app).post("/").send({});
    expect(res.status).toBe(400);
  });

  it("PUT /:id confirms an appointment", async () => {
    const res = await request(app).put("/apt-1").send({ status: "confirmed" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("PUT /:id cancels an appointment with reason", async () => {
    prisma.appointment.update = vi.fn().mockResolvedValue({
      ...fakeAppt, status: "cancelled", cancellationReason: "No se presentó",
    });
    const res = await request(app).put("/apt-1").send({
      status: "cancelled", cancellationReason: "No se presentó",
    });
    expect(res.status).toBe(200);
    expect(res.body.cancellationReason).toBe("No se presentó");
  });

  it("PUT /:id returns 404 when appointment not found", async () => {
    prisma.appointment.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/apt-999").send({ status: "confirmed" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:id deletes an appointment", async () => {
    const res = await request(app).delete("/apt-1");
    expect(res.status).toBe(204);
  });

  it("DELETE /:id returns 404 when appointment not found", async () => {
    prisma.appointment.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete("/apt-999");
    expect(res.status).toBe(404);
  });

  it("cannot access appointment from another business", async () => {
    prisma.appointment.findUnique = vi.fn().mockResolvedValue({ ...fakeAppt, businessId: "other-biz" });
    const res = await request(app).delete("/apt-1");
    expect(res.status).toBe(404);
  });
});

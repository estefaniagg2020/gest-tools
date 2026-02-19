import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { employeeRouter } from "../routes/employees.js";

const BIZ = "biz-1";
const fakeEmployee = {
  id: "emp-1", businessId: BIZ, name: "Ana García", photoUrl: null,
  linkedInUrl: null, phoneNumber: null, email: null,
  weeklyHours: 40, color: "#abc", role: "member",
  defaultWorkStartHour: 9, defaultWorkEndHour: 18,
  createdAt: new Date(), updatedAt: new Date(),
};

describe("Employees CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      employee: {
        findMany: vi.fn().mockResolvedValue([fakeEmployee]),
        findUnique: vi.fn().mockResolvedValue(fakeEmployee),
        create: vi.fn().mockResolvedValue({ ...fakeEmployee, id: "emp-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeEmployee, name: "Updated" }),
        delete: vi.fn().mockResolvedValue(fakeEmployee),
      },
    });
    app = withAuth(employeeRouter(prisma));
  });

  it("GET / returns employee list", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe("Ana García");
  });

  it("POST / creates an employee", async () => {
    const res = await request(app).post("/").send({ name: "Luis", color: "#fff" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("emp-new");
  });

  it("POST / returns 400 when name is missing", async () => {
    const res = await request(app).post("/").send({});
    expect(res.status).toBe(400);
  });

  it("PUT /:id updates an employee", async () => {
    const res = await request(app).put("/emp-1").send({ name: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated");
  });

  it("PUT /:id returns 404 when employee not found", async () => {
    prisma.employee.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/emp-999").send({ name: "X" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:id deletes an employee", async () => {
    const res = await request(app).delete("/emp-1");
    expect(res.status).toBe(204);
  });

  it("DELETE /:id returns 404 when employee not found", async () => {
    prisma.employee.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete("/emp-999");
    expect(res.status).toBe(404);
  });
});

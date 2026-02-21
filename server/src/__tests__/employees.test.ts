import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { employeeRouter } from "../routes/employees.js";

const BIZ = "biz-1";
const fakeMember = {
  id: "emp-1", businessId: BIZ, name: "Ana García", photoUrl: null,
  linkedInUrl: null, phone: null, email: null,
  weeklyHours: 40, color: "#abc", roleId: "role-1",
  userId: null, position: null, defaultWorkStartHour: 9, defaultWorkEndHour: 18,
  createdAt: new Date(), updatedAt: new Date(),
  role: { name: "employee" },
};

describe("Employees CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      workspaceMember: {
        findMany: vi.fn().mockResolvedValue([fakeMember]),
        findUnique: vi.fn().mockResolvedValue(fakeMember),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ ...fakeMember, id: "emp-new", role: { name: "employee" } }),
        update: vi.fn().mockResolvedValue({ ...fakeMember, name: "Updated", role: { name: "employee" } }),
        delete: vi.fn().mockResolvedValue(fakeMember),
      },
      role: {
        findUnique: vi.fn().mockResolvedValue({ id: "role-1", name: "employee" }),
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
    const res = await request(app).post("/").send({ name: "Luis", role: "employee", color: "#fff" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("emp-new");
  });

  it("POST / returns 400 when name is missing", async () => {
    const res = await request(app).post("/").send({});
    expect(res.status).toBe(400);
  });

  it("POST / returns 409 when member with same name exists", async () => {
    prisma.workspaceMember.findFirst = vi.fn().mockResolvedValue(fakeMember);
    const res = await request(app).post("/").send({ name: "Ana García", role: "employee" });
    expect(res.status).toBe(409);
  });

  it("PUT /:id updates an employee", async () => {
    const res = await request(app).put("/emp-1").send({ name: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated");
  });

  it("PUT /:id returns 404 when employee not found", async () => {
    prisma.workspaceMember.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put("/emp-999").send({ name: "X" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:id deletes an employee", async () => {
    const res = await request(app).delete("/emp-1");
    expect(res.status).toBe(204);
  });

  it("DELETE /:id returns 404 when employee not found", async () => {
    prisma.workspaceMember.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete("/emp-999");
    expect(res.status).toBe(404);
  });
});

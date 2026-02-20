import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { authRouter } from "../routes/auth.js";
import { withAuth, mockPrisma, TEST_USER } from "./helpers.js";

vi.mock("../utils/password.js", () => ({
  hashPassword: vi.fn(() => "hash"),
  verifyPassword: vi.fn(() => true),
  generateSalt: vi.fn(() => "salt"),
  generateSessionToken: vi.fn(() => "test-token-12345"),
}));

describe("Auth routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof express>;
  let appWithAuth: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      user: {
        count: vi.fn().mockResolvedValue(0),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      role: {
        findUnique: vi.fn().mockResolvedValue(null),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "role-1" }),
      },
    });
    app = express();
    app.use(express.json());
    app.use("/", authRouter(prisma));
    appWithAuth = withAuth(authRouter(prisma));
  });

  it("GET /setup-status returns hasUsers false when no users", async () => {
    const res = await request(app).get("/setup-status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ hasUsers: false });
  });

  it("GET /setup-status returns hasUsers true when users exist", async () => {
    vi.mocked(prisma.user.count).mockResolvedValue(1);
    const res = await request(app).get("/setup-status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ hasUsers: true });
  });

  it("POST /login returns 400 when username or password missing", async () => {
    const res = await request(app).post("/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("requeridos");
  });

  it("POST /login returns 401 when user not found", async () => {
    (prisma as any).user.findFirst = vi.fn().mockResolvedValue(null);
    const res = await request(app).post("/login").send({
      username: "unknown",
      password: "pass",
    });
    expect(res.status).toBe(401);
  });

  it("POST /login returns 200 and token when credentials valid", async () => {
    const user = {
      id: "u1",
      username: "admin",
      salt: "s",
      passwordHash: "h",
      name: "Admin",
      email: null,
      phone: null,
      role: { name: "admin" },
    };
    (prisma as any).user.findFirst = vi.fn().mockResolvedValue(user);
    (prisma as any).workspaceMember.findMany = vi.fn().mockResolvedValue([{ businessId: "biz-1" }]);
    const res = await request(app).post("/login").send({
      username: "admin",
      password: "correct",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("admin");
    expect(res.body.user.businessId).toBe("biz-1");
  });

  it("POST /register returns 403 when users already exist", async () => {
    (prisma as any).user.count = vi.fn().mockResolvedValue(1);
    const res = await request(app).post("/register").send({
      username: "newuser",
      password: "password",
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Ya existe");
  });

  it("POST /register returns 400 when username or password missing", async () => {
    const res = await request(app).post("/register").send({});
    expect(res.status).toBe(400);
  });

  it("POST /register returns 400 when password too short", async () => {
    const res = await request(app).post("/register").send({
      username: "newuser",
      password: "123",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("4 caracteres");
  });

  it("POST /logout returns 200", async () => {
    (prisma as any).user.findFirst = vi.fn().mockResolvedValue(TEST_USER);
    const res = await request(appWithAuth).post("/logout");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("PATCH /me returns 400 when nothing to update", async () => {
    (prisma as any).user.findFirst = vi.fn().mockResolvedValue(TEST_USER);
    const res = await request(appWithAuth).patch("/me").send({});
    expect(res.status).toBe(400);
  });

  it("PATCH /me returns 200 and updated user", async () => {
    (prisma as any).user.findFirst = vi.fn().mockResolvedValue(TEST_USER);
    (prisma as any).user.update = vi.fn().mockResolvedValue({
      id: TEST_USER.id,
      username: TEST_USER.username,
      name: "New Name",
      phone: "123",
      email: null,
      role: { name: "admin" },
    });
    (prisma as any).workspaceMember.findMany = vi.fn().mockResolvedValue([{ businessId: "biz-1" }]);
    const res = await request(appWithAuth).patch("/me").send({ name: "New Name", phone: "123" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("New Name");
  });
});

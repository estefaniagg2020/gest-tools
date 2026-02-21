import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { dashboardRouter } from "../routes/dashboard.js";

describe("Dashboard", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      appointment: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
      waitlistEntry: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      client: {
        count: vi.fn().mockResolvedValue(0),
      },
    });
    app = withAuth(dashboardRouter(prisma));
  });

  it("GET /stats returns 403 when user has no business", async () => {
    const prismaNoBiz = mockPrisma({
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "u1",
          username: "admin",
          role: { name: "admin" },
          name: "Admin",
          email: null,
          phone: null,
          workspaces: [],
        }),
      },
      appointment: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      waitlistEntry: { findMany: vi.fn().mockResolvedValue([]) },
      client: { count: vi.fn().mockResolvedValue(0) },
    });
    const appNoBiz = withAuth(dashboardRouter(prismaNoBiz));
    const res = await request(appNoBiz).get("/stats");
    expect(res.status).toBe(403);
  });

  it("GET /stats returns 200 with stats shape", async () => {
    const res = await request(app).get("/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reservasMes");
    expect(res.body).toHaveProperty("reservasSemana");
    expect(res.body).toHaveProperty("reservasCanceladas");
    expect(res.body).toHaveProperty("clientesNuevos");
  });
});

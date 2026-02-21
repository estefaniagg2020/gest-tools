import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { companyRouter } from "../routes/companies.js";

const fakeCompany = {
  id: "co-1",
  name: "Grupo Belleza SL",
  businesses: [{ id: "biz-1", name: "Salón Centro" }],
};

describe("Companies CRUD", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      company: {
        findMany: vi.fn().mockResolvedValue([fakeCompany]),
        create: vi.fn().mockResolvedValue({ ...fakeCompany, id: "co-new", businesses: [] }),
      },
    });
    app = withAuth(companyRouter(prisma));
  });

  it("should_return_company_list_when_GET_slash", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe("Grupo Belleza SL");
  });

  it("should_include_businesses_when_GET_slash", async () => {
    const res = await request(app).get("/");
    expect(res.body[0].businesses).toHaveLength(1);
  });

  it("should_create_company_when_POST_slash", async () => {
    const res = await request(app).post("/").send({ name: "Nueva Empresa SL" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("co-new");
  });

  it("should_return_500_when_create_fails", async () => {
    prisma.company.create = vi.fn().mockRejectedValue(new Error("DB error"));
    const res = await request(app).post("/").send({ name: "X" });
    expect(res.status).toBe(500);
  });
});

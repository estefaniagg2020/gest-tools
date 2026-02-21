import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { professionsRouter } from "../routes/professions.js";

vi.mock("../services/aiProfessionDiscovery.js", () => ({
  discoverProfessionWithAI: vi.fn().mockResolvedValue({
    valid: true,
    professionId: "fisioterapeuta",
    professionLabel: "Fisioterapeuta",
    categories: [
      {
        id: "fisio-cat-1",
        label: "Tratamientos",
        icon: "💆",
        services: [{ id: "fisio-svc-1", name: "Sesión manual", duration: 60, price: 50, description: null }],
      },
    ],
  }),
}));

import { discoverProfessionWithAI } from "../services/aiProfessionDiscovery.js";

const fakeProfession = {
  id: "peluqueria",
  code: "peluqueria",
  label: "Peluquería",
  sector: "Belleza",
  categories: [
    {
      id: "cat-1",
      label: "Cabello",
      icon: "✂️",
      services: [{ id: "svc-1", name: "Corte", duration: 45, price: 20, description: null }],
    },
  ],
};

describe("Professions routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = mockPrisma({
      profession: {
        findMany: vi.fn().mockResolvedValue([fakeProfession]),
        findUnique: vi.fn().mockResolvedValue(fakeProfession),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ ...fakeProfession, id: "fisioterapeuta" }),
      },
    });
    app = withAuth(professionsRouter(prisma));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should_return_all_professions_when_GET_slash", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body[0].label).toBe("Peluquería");
    expect(res.body[0].categories).toHaveLength(1);
  });

  it("should_return_first_20_when_search_query_is_empty", async () => {
    const res = await request(app).get("/search");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should_filter_by_similarity_when_search_query_provided", async () => {
    prisma.profession.findMany = vi.fn().mockResolvedValue([
      { ...fakeProfession, id: "peluqueria", label: "Peluquería" },
      { id: "fontanero", code: "fontanero", label: "Fontanero", sector: "Hogar", categories: [] },
    ]);
    const res = await request(app).get("/search").query({ q: "peluc" });
    expect(res.status).toBe(200);
  });

  it("should_return_profession_by_id_when_GET_id", async () => {
    const res = await request(app).get("/peluqueria");
    expect(res.status).toBe(200);
    expect(res.body.label).toBe("Peluquería");
  });

  it("should_return_404_when_profession_id_not_found", async () => {
    prisma.profession.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).get("/no-existe");
    expect(res.status).toBe(404);
  });

  it("should_return_400_when_discover_has_no_profession_name", async () => {
    const res = await request(app).post("/discover").send({ professionName: "" });
    expect(res.status).toBe(400);
  });

  it("should_return_existing_profession_from_db_when_discover_finds_match", async () => {
    prisma.profession.findFirst = vi.fn().mockResolvedValue(fakeProfession);
    const res = await request(app).post("/discover").send({ professionName: "Peluquería" });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("database");
  });

  it("should_return_503_when_discover_has_no_gemini_api_key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await request(app).post("/discover").send({ professionName: "Fisioterapeuta" });
    expect(res.status).toBe(503);
  });

  it("should_create_new_profession_via_ai_when_discover_valid_and_not_in_db", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    prisma.profession.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).post("/discover").send({ professionName: "Fisioterapeuta" });
    expect(res.status).toBe(201);
    expect(res.body.source).toBe("ai");
    expect(discoverProfessionWithAI).toHaveBeenCalledWith("Fisioterapeuta");
  });

  it("should_return_existing_db_profession_when_ai_discovers_already_saved_id", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    // First findUnique: alreadyExists check → found → takes the "already in DB" branch
    // Second findUnique: fetch full profession with categories
    prisma.profession.findUnique = vi.fn()
      .mockResolvedValueOnce({ id: "fisioterapeuta" })
      .mockResolvedValueOnce({ ...fakeProfession, id: "fisioterapeuta" });
    const res = await request(app).post("/discover").send({ professionName: "Fisioterapeuta" });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("database");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { settingsRouter } from "../routes/settings.js";

const BIZ = "biz-1";
const fakeConfig = {
  id: "cfg-1", businessId: BIZ,
  themeId: "default", colorMode: "system",
  sidebarPosition: "left", showNavbar: false,
  calendarAppearance: "default",
  sidebarModuleIds: ["inicio", "agenda"],
  dashboardModuleIds: [],
  startHour: 9, endHour: 20, slotDurationMinutes: 60,
  customColors: null, titleTextOverrides: null, moduleIcons: null,
  perAgendaColors: null, agendaListConfig: null,
  locale: "es", onboardingComplete: true,
  createdAt: new Date(), updatedAt: new Date(),
};

describe("Settings (GestorConfig) API", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      gestorConfig: {
        findUnique: vi.fn().mockResolvedValue(fakeConfig),
        upsert: vi.fn().mockResolvedValue({ ...fakeConfig, themeId: "dark", colorMode: "dark" }),
      },
    });
    app = withAuth(settingsRouter(prisma));
  });

  it("GET / returns current settings", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.themeId).toBe("default");
  });

  it("GET / returns empty object when no config exists", async () => {
    prisma.gestorConfig.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("PATCH / updates theme settings", async () => {
    const res = await request(app).patch("/").send({ themeId: "dark", colorMode: "dark" });
    expect(res.status).toBe(200);
    expect(res.body.themeId).toBe("dark");
    expect(prisma.gestorConfig.upsert).toHaveBeenCalled();
  });

  it("PATCH / updates layout settings", async () => {
    prisma.gestorConfig.upsert = vi.fn().mockResolvedValue({
      ...fakeConfig, sidebarPosition: "right",
    });
    const res = await request(app).patch("/").send({ sidebarPosition: "right" });
    expect(res.status).toBe(200);
    expect(res.body.sidebarPosition).toBe("right");
  });

  it("PATCH / updates scheduler settings", async () => {
    prisma.gestorConfig.upsert = vi.fn().mockResolvedValue({
      ...fakeConfig, startHour: 8, endHour: 22,
    });
    const res = await request(app).patch("/").send({ startHour: 8, endHour: 22 });
    expect(res.status).toBe(200);
    expect(res.body.startHour).toBe(8);
  });

  it("PATCH / ignores unknown keys", async () => {
    const res = await request(app).patch("/").send({ unknownKey: "evil", themeId: "dark" });
    expect(res.status).toBe(200);
    const [upsertCall] = vi.mocked(prisma.gestorConfig.upsert).mock.calls;
    const data = (upsertCall[0] as { update: Record<string, unknown> }).update;
    expect("unknownKey" in data).toBe(false);
    expect("themeId" in data).toBe(true);
  });
});

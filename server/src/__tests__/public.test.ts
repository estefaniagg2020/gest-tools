import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { publicRouter } from "../routes/public.js";

const fakeBusiness = {
  id: "biz-1",
  name: "Salón Glamour",
  slug: "salon-glamour",
  description: "Tu salón de confianza",
  publicPhoneNumber: "600111222",
  socialLinks: null,
  address: "Calle Mayor 1",
  email: "hola@salon.com",
  services: [
    {
      id: "svc-1",
      name: "Corte",
      onlineBookingEnabled: true,
      serviceCategory: { id: "cat-1", label: "Cabello", icon: "✂️" },
    },
  ],
  workspaceMembers: [{ id: "emp-1", name: "Ana", photoUrl: null, role: { name: "employee" }, position: null }],
};

describe("Public routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    prisma = mockPrisma({
      business: {
        findFirst: vi.fn().mockResolvedValue(fakeBusiness),
      },
    });
    app = withAuth(publicRouter(prisma));
  });

  it("should_return_public_business_profile_when_slug_exists", async () => {
    const res = await request(app).get("/business/salon-glamour");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Salón Glamour");
    expect(res.body.slug).toBe("salon-glamour");
  });

  it("should_return_contact_and_services_when_slug_exists", async () => {
    const res = await request(app).get("/business/salon-glamour");
    expect(res.body).toHaveProperty("contact");
    expect(res.body.services).toHaveLength(1);
    expect(res.body.team).toHaveLength(1);
  });

  it("should_return_404_when_slug_not_found", async () => {
    prisma.business.findFirst = vi.fn().mockResolvedValue(null);
    const res = await request(app).get("/business/no-existe");
    expect(res.status).toBe(404);
  });

  it("should_return_hardcoded_slots_when_GET_availability", async () => {
    const res = await request(app).get("/availability");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(res.body.slots.length).toBeGreaterThan(0);
  });
});

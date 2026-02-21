import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { businessRouter } from "../routes/businesses.js";

vi.mock("../services/availability.js", () => ({
  getAvailableSlots: vi.fn().mockResolvedValue(["10:00", "11:00", "12:00"]),
  getSmartSlots: vi.fn().mockResolvedValue(["10:00", "11:00"]),
  getOccupiedSlots: vi.fn().mockResolvedValue(["09:00"]),
}));

import { getAvailableSlots, getSmartSlots, getOccupiedSlots } from "../services/availability.js";

const BIZ = "biz-1";

const fakeBusiness = {
  id: BIZ,
  name: "Salón Glamour",
  professionId: "peluqueria",
  gestorConfig: { id: "cfg-1", businessId: BIZ },
  company: null,
  logoUrl: null,
  email: null,
  phone: null,
  address: null,
  taxId: null,
  businessAddress: null,
  businessPopulation: null,
  isCanarias: false,
  description: null,
  publicPhoneNumber: null,
  slug: "salon-glamour",
  socialLinks: null,
};

const fakeConfig = {
  id: "cfg-1",
  businessId: BIZ,
  numberOfPeople: 3,
  onboardingComplete: true,
  hiddenSystemServiceNames: [],
  startHour: 9,
  endHour: 20,
};

const fakeService = {
  id: "svc-1",
  businessId: BIZ,
  name: "Corte",
  duration: 45,
  price: 20,
  description: null,
  categoryId: "cat-1",
  category: "",
  serviceCategory: { id: "cat-1", label: "Cabello", icon: "✂️" },
};

describe("Businesses routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = mockPrisma({
      business: {
        findMany: vi.fn().mockResolvedValue([fakeBusiness]),
        findUnique: vi.fn().mockResolvedValue(fakeBusiness),
        create: vi.fn().mockResolvedValue({ ...fakeBusiness, id: "biz-new" }),
        update: vi.fn().mockResolvedValue(fakeBusiness),
      },
      gestorConfig: {
        findUnique: vi.fn().mockResolvedValue(fakeConfig),
        upsert: vi.fn().mockResolvedValue(fakeConfig),
        update: vi.fn().mockResolvedValue(fakeConfig),
      },
      professionCategory: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      service: {
        findMany: vi.fn().mockResolvedValue([fakeService]),
        findFirst: vi.fn().mockResolvedValue(fakeService),
        create: vi.fn().mockResolvedValue({ ...fakeService, id: "svc-new" }),
        update: vi.fn().mockResolvedValue({ ...fakeService, name: "Corte Actualizado" }),
        delete: vi.fn().mockResolvedValue(fakeService),
      },
      professionService: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      serviceCategory: {
        findFirst: vi.fn().mockResolvedValue({ id: "cat-1", label: "Cabello", icon: "✂️" }),
        create: vi.fn().mockResolvedValue({ id: "cat-new" }),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    });
    app = withAuth(businessRouter(prisma));
  });

  it("should_return_business_list_when_GET_slash", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Salón Glamour");
  });

  it("should_create_business_when_POST_slash", async () => {
    const res = await request(app).post("/").send({ name: "Nuevo Negocio" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("biz-new");
  });

  it("should_return_service_catalog_grouped_by_category_when_GET_id_catalog", async () => {
    const res = await request(app).get(`/${BIZ}/catalog`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("services");
  });

  it("should_return_flat_service_list_when_GET_id_services", async () => {
    const res = await request(app).get(`/${BIZ}/services`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("category");
    expect(res.body[0]).toHaveProperty("serviceCategory");
  });

  it("should_create_service_when_POST_id_services_with_valid_data", async () => {
    const res = await request(app).post(`/${BIZ}/services`).send({
      name: "Tinte", duration: 90, price: 45, categoryId: "cat-1",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("svc-new");
  });

  it("should_return_400_when_POST_services_missing_required_fields", async () => {
    const res = await request(app).post(`/${BIZ}/services`).send({ name: "Tinte" });
    expect(res.status).toBe(400);
  });

  it("should_update_user_service_when_PUT_id_services_serviceId", async () => {
    const res = await request(app).put(`/${BIZ}/services/svc-1`).send({ name: "Corte Actualizado" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Corte Actualizado");
  });

  it("should_return_404_when_updating_service_not_found", async () => {
    prisma.businessService.findFirst = vi.fn().mockResolvedValue(null);
    const res = await request(app).put(`/${BIZ}/services/no-svc`).send({ name: "X" });
    expect(res.status).toBe(404);
  });

  it("should_replace_system_service_with_custom_when_PUT_id_services_systemServiceId", async () => {
    prisma.professionService.findUnique = vi.fn().mockResolvedValue({
      id: "sys-svc-1",
      name: "Corte Sistema",
      duration: 45,
      price: 20,
      description: null,
      category: { id: "cat-1", label: "Cabello", icon: "✂️" },
    });
    const res = await request(app).put(`/${BIZ}/services/sys-svc-1`).send({ price: 25 });
    expect(res.status).toBe(200);
    expect(prisma.gestorConfig.upsert).toHaveBeenCalled();
    expect(prisma.businessService.create).toHaveBeenCalled();
  });

  it("should_delete_user_service_when_DELETE_id_services_serviceId", async () => {
    const res = await request(app).delete(`/${BIZ}/services/svc-1`);
    expect(res.status).toBe(204);
    expect(prisma.businessService.delete).toHaveBeenCalled();
  });

  it("should_return_404_when_deleting_service_not_found", async () => {
    prisma.businessService.findFirst = vi.fn().mockResolvedValue(null);
    const res = await request(app).delete(`/${BIZ}/services/no-svc`);
    expect(res.status).toBe(404);
  });

  it("should_hide_system_service_when_DELETE_id_services_systemServiceId", async () => {
    prisma.professionService.findUnique = vi.fn().mockResolvedValue({ id: "sys-svc-1", name: "Corte Sistema" });
    const res = await request(app).delete(`/${BIZ}/services/sys-svc-1`);
    expect(res.status).toBe(204);
    expect(prisma.gestorConfig.upsert).toHaveBeenCalled();
    expect(prisma.businessService.delete).not.toHaveBeenCalled();
  });

  it("should_return_400_when_availability_missing_required_query_params", async () => {
    const res = await request(app).get(`/${BIZ}/availability`).query({ date: "2025-06-15" });
    expect(res.status).toBe(400);
  });

  it("should_return_available_slots_when_GET_id_availability_with_valid_params", async () => {
    const res = await request(app).get(`/${BIZ}/availability`).query({ date: "2025-06-15", serviceId: "svc-1" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(getAvailableSlots).toHaveBeenCalled();
  });

  it("should_call_smart_slots_when_smart_param_is_true", async () => {
    const res = await request(app).get(`/${BIZ}/availability`).query({
      date: "2025-06-15", serviceId: "svc-1", smart: "true",
    });
    expect(res.status).toBe(200);
    expect(getSmartSlots).toHaveBeenCalled();
  });

  it("should_return_400_when_occupied_slots_missing_required_params", async () => {
    const res = await request(app).get(`/${BIZ}/occupied-slots`).query({ serviceId: "svc-1" });
    expect(res.status).toBe(400);
  });

  it("should_return_occupied_slots_when_GET_id_occupied-slots_with_valid_params", async () => {
    const res = await request(app).get(`/${BIZ}/occupied-slots`).query({ date: "2025-06-15", serviceId: "svc-1" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(getOccupiedSlots).toHaveBeenCalled();
  });

  it("should_return_merged_config_and_business_when_GET_id_config", async () => {
    const res = await request(app).get(`/${BIZ}/config`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("companyName", "Salón Glamour");
    expect(res.body.numberOfPeople).toBe(3);
  });

  it("should_return_404_when_config_not_found", async () => {
    prisma.gestorConfig.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).get(`/${BIZ}/config`);
    expect(res.status).toBe(404);
  });

  it("should_update_config_fields_when_PUT_id_config", async () => {
    const res = await request(app).put(`/${BIZ}/config`).send({
      companyName: "Salón Actualizado",
      startHour: 8,
    });
    expect(res.status).toBe(200);
    expect(prisma.gestorConfig.upsert).toHaveBeenCalled();
  });

  it("should_return_404_when_PUT_config_business_not_found", async () => {
    prisma.business.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).put(`/${BIZ}/config`).send({ startHour: 8 });
    expect(res.status).toBe(404);
  });
});

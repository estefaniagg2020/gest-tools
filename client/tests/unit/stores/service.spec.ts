import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServiceStore } from "@/stores/service";
import { useAuthStore } from "@/stores/auth";
import { bookingApi } from "@/infrastructure/bookingApi";

vi.mock("@/infrastructure/bookingApi", () => ({
  bookingApi: {
    getCatalog: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
  },
}));

const mockCatalog = [
  {
    id: "cat-1",
    label: "Masajes",
    icon: "spa",
    services: [
      {
        id: "svc-1",
        name: "Masaje 30min",
        duration: 30,
        price: 25,
        description: null,
        isSystemService: false,
      },
    ],
  },
];

describe("useServiceStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.$patch({ user: { businessId: "b1" } as any });
    vi.mocked(bookingApi.getCatalog).mockResolvedValue(mockCatalog);
  });

  it("should_start_with_empty_services_until_initialized", () => {
    const store = useServiceStore();
    expect(store.services).toEqual([]);
  });

  it("should_have_services_after_initialize", async () => {
    const store = useServiceStore();
    await store.initialize();
    expect(store.services.length).toBeGreaterThan(0);
    expect(store.services[0].name).toBe("Masaje 30min");
    expect(store.services[0].id).toBe("svc-1");
  });

  it("should_return_service_by_id", async () => {
    const store = useServiceStore();
    await store.initialize();
    const service = store.getServiceById("svc-1");
    expect(service?.id).toBe("svc-1");
    expect(service?.name).toBe("Masaje 30min");
  });

  it("should_return_undefined_for_unknown_id", async () => {
    const store = useServiceStore();
    await store.initialize();
    expect(store.getServiceById("unknown-id")).toBeUndefined();
  });

  it("should_filter_services_by_category", async () => {
    const store = useServiceStore();
    await store.initialize();
    const manual = store.getServicesByCategory("cat-1");
    expect(manual.every((s) => s.categoryId === "cat-1")).toBe(true);
  });
});

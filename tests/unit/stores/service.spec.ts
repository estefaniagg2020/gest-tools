import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServiceStore } from "@/stores/service";

describe("useServiceStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should_have_default_services", () => {
    const store = useServiceStore();
    expect(store.services.length).toBeGreaterThan(0);
  });

  it("should_return_service_by_id", () => {
    const store = useServiceStore();
    const id = store.services[0]?.id ?? "";
    const service = store.getServiceById(id);
    expect(service?.id).toBe(id);
  });

  it("should_return_null_for_unknown_id", () => {
    const store = useServiceStore();
    expect(store.getServiceById("unknown-id")).toBeUndefined();
  });

  it("should_filter_services_by_category", () => {
    const store = useServiceStore();
    const manual = store.getServicesByCategory("manual");
    expect(manual.every((s) => s.category === "manual")).toBe(true);
  });
});

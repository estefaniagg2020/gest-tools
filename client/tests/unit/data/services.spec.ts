import { describe, it, expect } from "vitest";
import type { Service } from "@/interfaces";
import { DEFAULT_SERVICES } from "@/data/services";

describe("DEFAULT_SERVICES", () => {
  it("should_have_at_least_one_service", () => {
    expect(DEFAULT_SERVICES.length).toBeGreaterThan(0);
  });

  it("should_have_required_service_fields", () => {
    const first = DEFAULT_SERVICES[0] as Service;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("duration");
    expect(first).toHaveProperty("price");
  });

  it("should_have_unique_ids", () => {
    const ids = DEFAULT_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

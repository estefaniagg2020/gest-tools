import { describe, it, expect } from "vitest";
import type { Spa } from "@/interfaces";
import { DEFAULT_SPAS } from "@/data/spas";

describe("DEFAULT_SPAS", () => {
  it("should_have_at_least_one_spa", () => {
    expect(DEFAULT_SPAS.length).toBeGreaterThan(0);
  });

  it("should_have_required_spa_fields", () => {
    const first = DEFAULT_SPAS[0] as Spa;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("themeColor");
  });

  it("should_have_unique_ids", () => {
    const ids = DEFAULT_SPAS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

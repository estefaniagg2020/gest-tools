import { describe, it, expect } from "vitest";
import { NAV_LINKS, ROUTE_HOME } from "@/data/navLinks";

describe("navLinks", () => {
  it("should_export_ROUTE_HOME_as_root", () => {
    expect(ROUTE_HOME).toBe("/");
  });

  it("should_have_scheduler_therapists_spas_links", () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(3);
    const toPaths = NAV_LINKS.map((l) => l.to);
    expect(toPaths).toContain("/scheduler");
    expect(toPaths).toContain("/therapists");
    expect(toPaths).toContain("/spas");
  });

  it("should_have_icon_and_label_per_link", () => {
    for (const link of NAV_LINKS) {
      expect(link).toHaveProperty("to");
      expect(link).toHaveProperty("icon");
      expect(link).toHaveProperty("label");
    }
  });
});

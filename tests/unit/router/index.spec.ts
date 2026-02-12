import { describe, it, expect } from "vitest";
import router from "@/router";

describe("router", () => {
  it("should_have_dashboard_route", () => {
    const match = router.getRoutes().find((r) => r.name === "dashboard");
    expect(match).toBeDefined();
    expect(match?.name).toBe("dashboard");
  });

  it("should_have_scheduler_therapists_spas_routes", () => {
    const names = router
      .getRoutes()
      .map((r) => r.name)
      .filter(Boolean);
    expect(names).toContain("dashboard");
    expect(names).toContain("scheduler");
    expect(names).toContain("therapists");
    expect(names).toContain("spas");
  });

  it("should_have_scheduler_route_with_expected_path", () => {
    const scheduler = router.getRoutes().find((r) => r.name === "scheduler");
    expect(scheduler).toBeDefined();
    expect(scheduler?.path).toMatch(/scheduler/);
  });
});

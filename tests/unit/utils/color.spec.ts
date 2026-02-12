import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generatePastelColor } from "@/utils/color";

describe("generatePastelColor", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should_return_hsl_string", () => {
    const color = generatePastelColor();
    expect(color).toMatch(/^hsl\(\d+,\s*70%,\s*85%\)$/);
  });

  it("should_use_mocked_random_for_reproducible_hue", () => {
    const spy = vi.spyOn(Math, "random");
    spy.mockReturnValue(0);
    expect(generatePastelColor()).toBe("hsl(0, 70%, 85%)");
    spy.mockReturnValue(1);
    expect(generatePastelColor()).toBe("hsl(360, 70%, 85%)");
  });
});

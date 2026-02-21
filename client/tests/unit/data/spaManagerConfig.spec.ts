import { describe, it, expect } from "vitest";
import { THEME_COLORS, getThemeClasses } from "@/data/spaManagerConfig";

describe("spaManagerConfig", () => {
  describe("THEME_COLORS", () => {
    it("should_have_teal_purple_blue_orange_pink", () => {
      const values = THEME_COLORS.map((c) => c.value);
      expect(values).toContain("teal");
      expect(values).toContain("purple");
      expect(values).toContain("blue");
      expect(values).toContain("orange");
      expect(values).toContain("pink");
    });

    it("should_have_label_and_bgClass_per_entry", () => {
      for (const c of THEME_COLORS) {
        expect(c).toHaveProperty("value");
        expect(c).toHaveProperty("label");
        expect(c).toHaveProperty("bgClass");
      }
    });
  });

  describe("getThemeClasses", () => {
    it("should_return_teal_classes_for_teal", () => {
      expect(getThemeClasses("teal")).toContain("bg-brand-accent");
    });

    it("should_return_purple_classes_for_purple", () => {
      expect(getThemeClasses("purple")).toContain("bg-purple-500");
    });

    it("should_return_default_gray_for_unknown", () => {
      expect(getThemeClasses("unknown")).toBe("bg-gray-500");
    });
  });
});

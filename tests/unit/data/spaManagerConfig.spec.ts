import { describe, it, expect } from "vitest";
import {
  THEME_COLORS,
  SERVICE_CATEGORIES_FOR_SPA,
  getThemeClasses,
} from "@/data/spaManagerConfig";

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

  describe("SERVICE_CATEGORIES_FOR_SPA", () => {
    it("should_have_manual_hydrotherapy_aesthetic_wellness", () => {
      const values = SERVICE_CATEGORIES_FOR_SPA.map((c) => c.value);
      expect(values).toContain("manual");
      expect(values).toContain("hydrotherapy");
      expect(values).toContain("aesthetic");
      expect(values).toContain("wellness");
    });

    it("should_have_icon_and_borderClass_per_entry", () => {
      for (const c of SERVICE_CATEGORIES_FOR_SPA) {
        expect(c).toHaveProperty("icon");
        expect(c).toHaveProperty("borderClass");
      }
    });
  });

  describe("getThemeClasses", () => {
    it("should_return_teal_classes_for_teal", () => {
      expect(getThemeClasses("teal")).toContain("bg-spa-teal");
    });

    it("should_return_purple_classes_for_purple", () => {
      expect(getThemeClasses("purple")).toContain("bg-purple-500");
    });

    it("should_return_default_gray_for_unknown", () => {
      expect(getThemeClasses("unknown")).toBe("bg-gray-500");
    });
  });
});

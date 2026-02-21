import { describe, it, expect } from "vitest";
import {
  normalizeHex,
  normalizeAgendaColorsConfig,
} from "@/utils/agendaColorsValidation";
import type { AgendaColorsConfig } from "@/interfaces/agendaColors";

const defaultConfig: AgendaColorsConfig = {
  sameColorsForAll: true,
  agendaBg: "#ffffff",
  markedDaysColor: "#3498db",
  vacationColor: "#e74c3c",
  perAgendaColors: undefined,
};

describe("agendaColorsValidation", () => {
  describe("normalizeHex", () => {
    it("should_return_value_when_valid_hex", () => {
      expect(normalizeHex("#ffffff", "#000000")).toBe("#ffffff");
      expect(normalizeHex("#AbCdEf", "#000")).toBe("#AbCdEf");
      expect(normalizeHex("#000000", "#fff")).toBe("#000000");
    });

    it("should_return_fallback_when_not_string", () => {
      expect(normalizeHex(null, "#fff")).toBe("#fff");
      expect(normalizeHex(123, "#fff")).toBe("#fff");
      expect(normalizeHex(undefined, "#fff")).toBe("#fff");
    });

    it("should_return_fallback_when_invalid_hex_format", () => {
      expect(normalizeHex("ffffff", "#fff")).toBe("#fff");
      expect(normalizeHex("#fff", "#fff")).toBe("#fff");
      expect(normalizeHex("#gggggg", "#fff")).toBe("#fff");
      expect(normalizeHex("#12345", "#fff")).toBe("#fff");
      expect(normalizeHex("", "#fff")).toBe("#fff");
    });
  });

  describe("normalizeAgendaColorsConfig", () => {
    it("should_return_defaults_when_raw_empty", () => {
      const result = normalizeAgendaColorsConfig({}, defaultConfig);
      expect(result.agendaBg).toBe(defaultConfig.agendaBg);
      expect(result.markedDaysColor).toBe(defaultConfig.markedDaysColor);
      expect(result.vacationColor).toBe(defaultConfig.vacationColor);
      expect(result.sameColorsForAll).toBe(defaultConfig.sameColorsForAll);
      expect(result.perAgendaColors).toBeUndefined();
    });

    it("should_use_valid_hex_values_from_raw", () => {
      const raw = {
        agendaBg: "#f0f0f0",
        markedDaysColor: "#111111",
        vacationColor: "#abcdef",
      };
      const result = normalizeAgendaColorsConfig(raw, defaultConfig);
      expect(result.agendaBg).toBe("#f0f0f0");
      expect(result.markedDaysColor).toBe("#111111");
      expect(result.vacationColor).toBe("#abcdef");
    });

    it("should_fallback_invalid_hex_to_theme_defaults", () => {
      const raw = {
        agendaBg: "not-hex",
        markedDaysColor: "#222222",
        vacationColor: 123,
      };
      const result = normalizeAgendaColorsConfig(raw, defaultConfig);
      expect(result.agendaBg).toBe(defaultConfig.agendaBg);
      expect(result.markedDaysColor).toBe("#222222");
      expect(result.vacationColor).toBe(defaultConfig.vacationColor);
    });

    it("should_use_sameColorsForAll_from_raw_when_boolean", () => {
      const resultTrue = normalizeAgendaColorsConfig(
        { sameColorsForAll: true },
        defaultConfig,
      );
      expect(resultTrue.sameColorsForAll).toBe(true);
      const resultFalse = normalizeAgendaColorsConfig(
        { sameColorsForAll: false },
        defaultConfig,
      );
      expect(resultFalse.sameColorsForAll).toBe(false);
    });

    it("should_fallback_sameColorsForAll_when_not_boolean", () => {
      const result = normalizeAgendaColorsConfig(
        { sameColorsForAll: "yes" },
        defaultConfig,
      );
      expect(result.sameColorsForAll).toBe(defaultConfig.sameColorsForAll);
    });

    it("should_normalize_perAgendaColors_when_non_empty_array", () => {
      const raw = {
        agendaBg: "#ffffff",
        markedDaysColor: "#3498db",
        vacationColor: "#e74c3c",
        perAgendaColors: [
          { agendaBg: "#cccccc", markedDaysColor: "#0000ff", vacationColor: "#ff0000" },
          { agendaBg: "invalid", markedDaysColor: "#00ff00", vacationColor: "#00ffff" },
        ],
      };
      const result = normalizeAgendaColorsConfig(raw, defaultConfig);
      expect(result.perAgendaColors).toHaveLength(2);
      expect(result.perAgendaColors![0]).toEqual({
        agendaBg: "#cccccc",
        markedDaysColor: "#0000ff",
        vacationColor: "#ff0000",
      });
      expect(result.perAgendaColors![1].agendaBg).toBe(defaultConfig.agendaBg);
      expect(result.perAgendaColors![1].markedDaysColor).toBe("#00ff00");
      expect(result.perAgendaColors![1].vacationColor).toBe("#00ffff");
    });

    it("should_use_global_set_as_fallback_for_per_agenda_item_without_agendaBg", () => {
      const raw = {
        agendaBg: "#111111",
        markedDaysColor: "#222222",
        vacationColor: "#333333",
        perAgendaColors: [{ markedDaysColor: "#444444" } as unknown as Record<string, unknown>],
      };
      const result = normalizeAgendaColorsConfig(raw, defaultConfig);
      expect(result.perAgendaColors).toHaveLength(1);
      expect(result.perAgendaColors![0].agendaBg).toBe("#111111");
      expect(result.perAgendaColors![0].markedDaysColor).toBe("#222222");
      expect(result.perAgendaColors![0].vacationColor).toBe("#333333");
    });

    it("should_not_set_perAgendaColors_when_empty_array", () => {
      const raw = {
        agendaBg: "#ffffff",
        markedDaysColor: "#3498db",
        vacationColor: "#e74c3c",
        perAgendaColors: [],
      };
      const result = normalizeAgendaColorsConfig(raw, defaultConfig);
      expect(result.perAgendaColors).toBeUndefined();
    });

    it("should_not_set_perAgendaColors_when_not_array", () => {
      const raw = {
        agendaBg: "#ffffff",
        markedDaysColor: "#3498db",
        vacationColor: "#e74c3c",
        perAgendaColors: {},
      };
      const result = normalizeAgendaColorsConfig(raw, defaultConfig);
      expect(result.perAgendaColors).toBeUndefined();
    });
  });
});

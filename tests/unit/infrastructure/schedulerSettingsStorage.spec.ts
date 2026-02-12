import { describe, it, expect, beforeEach } from "vitest";
import type { SchedulerViewSettings } from "@/interfaces";
import { loadSchedulerSettings, saveSchedulerSettings } from "@/infrastructure/schedulerSettingsStorage";

const KEY = "spa-scheduler-view-settings";

describe("schedulerSettingsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const validSettings: SchedulerViewSettings = {
    startHour: 8,
    endHour: 20,
    pixelsPerHour: 90,
    slotDurationMinutes: 60,
  };

  describe("loadSchedulerSettings", () => {
    it("should_return_null_when_no_data_stored", () => {
      expect(loadSchedulerSettings()).toBeNull();
    });

    it("should_return_parsed_settings_when_valid_json_stored", () => {
      localStorage.setItem(KEY, JSON.stringify(validSettings));
      expect(loadSchedulerSettings()).toEqual(validSettings);
    });

    it("should_return_null_when_missing_required_fields", () => {
      localStorage.setItem(KEY, JSON.stringify({ startHour: 8 }));
      expect(loadSchedulerSettings()).toBeNull();
    });

    it("should_normalize_slotDurationMinutes_to_60_when_invalid", () => {
      const stored = {
        startHour: 8,
        endHour: 20,
        pixelsPerHour: 90,
        slotDurationMinutes: 99,
      };
      localStorage.setItem(KEY, JSON.stringify(stored));
      expect(loadSchedulerSettings()?.slotDurationMinutes).toBe(60);
    });

    it("should_return_null_when_invalid_json", () => {
      localStorage.setItem(KEY, "invalid");
      expect(loadSchedulerSettings()).toBeNull();
    });
  });

  describe("saveSchedulerSettings", () => {
    it("should_persist_settings_for_loadSchedulerSettings", () => {
      saveSchedulerSettings(validSettings);
      expect(loadSchedulerSettings()).toEqual(validSettings);
    });
  });
});

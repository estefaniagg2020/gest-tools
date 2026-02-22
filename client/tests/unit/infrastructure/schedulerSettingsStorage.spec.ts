import { describe, it, expect, beforeEach } from "vitest";
import type { SchedulerViewSettings } from "@/interfaces";
import {
  loadSchedulerSettings,
  resetSchedulerSettingsStorage,
  saveSchedulerSettings,
} from "@/infrastructure/schedulerSettingsStorage";

describe("schedulerSettingsStorage", () => {
  beforeEach(() => {
    resetSchedulerSettingsStorage();
  });

  const validSettings: SchedulerViewSettings = {
    startHour: 8,
    endHour: 20,
    pixelsPerHour: 90,
    slotDurationMinutes: 60,
    workDaysPerWeek: 5,
    maxPeoplePerSlot: 1,
    defaultView: "week",
    weekStart: "locale",
  };

  describe("loadSchedulerSettings", () => {
    it("should_return_null_when_no_data_stored", () => {
      expect(loadSchedulerSettings()).toBeNull();
    });

    it("should_return_saved_settings_when_data_is_saved", () => {
      saveSchedulerSettings(validSettings);
      expect(loadSchedulerSettings()).toEqual(validSettings);
    });
  });

  describe("saveSchedulerSettings", () => {
    it("should_persist_settings_for_loadSchedulerSettings", () => {
      saveSchedulerSettings(validSettings);
      expect(loadSchedulerSettings()).toEqual(validSettings);
    });
  });
});

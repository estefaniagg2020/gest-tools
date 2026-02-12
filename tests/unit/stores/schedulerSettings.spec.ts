import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
import * as storage from "@/infrastructure/schedulerSettingsStorage";

vi.mock("@/infrastructure/schedulerSettingsStorage", () => ({
  loadSchedulerSettings: vi.fn(),
  saveSchedulerSettings: vi.fn(),
}));

describe("useSchedulerSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(storage.loadSchedulerSettings).mockReturnValue(null);
    vi.mocked(storage.saveSchedulerSettings).mockImplementation(() => {});
  });

  it("should_initialize_with_defaults_when_no_stored_settings", () => {
    const store = useSchedulerSettingsStore();
    store.initialize();
    expect(store.startHour).toBe(8);
    expect(store.endHour).toBe(20);
    expect(store.pixelsPerHour).toBe(90);
    expect(store.slotDurationMinutes).toBe(60);
  });

  it("should_initialize_from_stored_settings", () => {
    vi.mocked(storage.loadSchedulerSettings).mockReturnValue({
      startHour: 7,
      endHour: 22,
      pixelsPerHour: 100,
      slotDurationMinutes: 30,
    });
    const store = useSchedulerSettingsStore();
    store.initialize();
    expect(store.startHour).toBe(7);
    expect(store.endHour).toBe(22);
    expect(store.pixelsPerHour).toBe(100);
    expect(store.slotDurationMinutes).toBe(30);
  });

  it("should_expose_settings_computed", () => {
    const store = useSchedulerSettingsStore();
    store.initialize();
    expect(store.settings).toEqual({
      startHour: 8,
      endHour: 20,
      pixelsPerHour: 90,
      slotDurationMinutes: 60,
    });
  });

  it("should_update_and_persist_settings", () => {
    const store = useSchedulerSettingsStore();
    store.initialize();
    store.updateSettings({ startHour: 9, slotDurationMinutes: 90 });
    expect(store.startHour).toBe(9);
    expect(store.slotDurationMinutes).toBe(90);
    expect(storage.saveSchedulerSettings).toHaveBeenCalled();
  });
});

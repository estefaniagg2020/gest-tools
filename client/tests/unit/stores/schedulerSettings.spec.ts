import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/infrastructure/businessConfigApi", () => ({
  businessConfigApi: {
    getConfig: vi.fn().mockResolvedValue(null),
    updateConfig: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("useSchedulerSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.$patch({
      user: { id: "u1", businessId: "b1" } as any,
      currentUserId: "u1",
    });
  });

  it("should_expose_defaults_from_gestor_config", () => {
    const store = useSchedulerSettingsStore();
    store.initialize();
    expect(store.startHour).toBe(9);
    expect(store.endHour).toBe(20);
    expect(store.pixelsPerHour).toBe(80);
    expect(store.slotDurationMinutes).toBe(60);
  });

  it("should_reflect_gestor_config_when_updated", () => {
    const configStore = useGestorConfigStore();
    configStore.startHour = 8;
    configStore.endHour = 22;
    configStore.pixelsPerHour = 100;
    configStore.slotDurationMinutes = 30;
    const store = useSchedulerSettingsStore();
    store.initialize();
    expect(store.startHour).toBe(8);
    expect(store.endHour).toBe(22);
    expect(store.pixelsPerHour).toBe(100);
    expect(store.slotDurationMinutes).toBe(30);
  });

  it("should_expose_settings_computed", () => {
    const configStore = useGestorConfigStore();
    configStore.startHour = 8;
    configStore.endHour = 20;
    configStore.pixelsPerHour = 90;
    configStore.slotDurationMinutes = 60;
    const store = useSchedulerSettingsStore();
    store.initialize();
    expect(store.settings).toMatchObject({
      startHour: 8,
      endHour: 20,
      pixelsPerHour: 90,
      slotDurationMinutes: 60,
    });
  });

  it("should_update_and_persist_via_gestor_config", async () => {
    const store = useSchedulerSettingsStore();
    store.initialize();
    await store.updateSettings({ startHour: 9, slotDurationMinutes: 90 });
    expect(store.startHour).toBe(9);
    expect(store.slotDurationMinutes).toBe(90);
  });
});

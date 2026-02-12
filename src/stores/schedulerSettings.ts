import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { SchedulerViewSettings, SlotDurationMinutes } from "@/interfaces";
import { loadSchedulerSettings, saveSchedulerSettings } from "@/infrastructure/schedulerSettingsStorage";
import { SCHEDULE_VIEW_SETTINGS } from "@/data/constants";
import { clampHour, clampPixels, clampSlotDuration, MAX_HOUR } from "@/utils/schedulerSettingsValidation";

export const useSchedulerSettingsStore = defineStore("schedulerSettings", () => {
  const startHour = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_START_HOUR);
  const endHour = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_END_HOUR);
  const pixelsPerHour = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_PIXELS_PER_HOUR);
  const slotDurationMinutes = ref<SlotDurationMinutes>(
    SCHEDULE_VIEW_SETTINGS.DEFAULT_SLOT_DURATION as SlotDurationMinutes,
  );

  const settings = computed<SchedulerViewSettings>(() => ({
    startHour: startHour.value,
    endHour: endHour.value,
    pixelsPerHour: pixelsPerHour.value,
    slotDurationMinutes: slotDurationMinutes.value,
  }));

  function initialize() {
    const stored = loadSchedulerSettings();
    if (stored) {
      startHour.value = clampHour(stored.startHour);
      endHour.value = clampHour(stored.endHour);
      pixelsPerHour.value = clampPixels(stored.pixelsPerHour);
      slotDurationMinutes.value = clampSlotDuration(
        stored.slotDurationMinutes ?? SCHEDULE_VIEW_SETTINGS.DEFAULT_SLOT_DURATION,
      );
      if (startHour.value >= endHour.value) {
        endHour.value = Math.min(MAX_HOUR, startHour.value + 1);
      }
    } else {
      startHour.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_START_HOUR;
      endHour.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_END_HOUR;
      pixelsPerHour.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_PIXELS_PER_HOUR;
      slotDurationMinutes.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_SLOT_DURATION as SlotDurationMinutes;
    }
  }

  function updateSettings(updates: Partial<SchedulerViewSettings>) {
    if (updates.startHour !== undefined) startHour.value = clampHour(updates.startHour);
    if (updates.endHour !== undefined) endHour.value = clampHour(updates.endHour);
    if (updates.pixelsPerHour !== undefined) pixelsPerHour.value = clampPixels(updates.pixelsPerHour);
    if (updates.slotDurationMinutes !== undefined)
      slotDurationMinutes.value = clampSlotDuration(updates.slotDurationMinutes);
    if (startHour.value >= endHour.value) {
      endHour.value = Math.min(MAX_HOUR, startHour.value + 1);
    }
    saveSchedulerSettings(settings.value);
  }

  return {
    startHour,
    endHour,
    pixelsPerHour,
    slotDurationMinutes,
    settings,
    initialize,
    updateSettings,
  };
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { DefaultViewType, SchedulerViewSettings, SlotDurationMinutes, WeekStartOption } from "@/interfaces";
import { loadSchedulerSettings, saveSchedulerSettings } from "@/infrastructure/schedulerSettingsStorage";
import { SCHEDULE_VIEW_SETTINGS } from "@/data/constants";
import {
  clampHour,
  clampPixels,
  clampSlotDuration,
  clampWorkDaysPerWeek,
  clampMaxPeoplePerSlot,
  MAX_HOUR,
} from "@/utils/schedulerSettingsValidation";

export const useSchedulerSettingsStore = defineStore("schedulerSettings", () => {
  const startHour = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_START_HOUR);
  const endHour = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_END_HOUR);
  const pixelsPerHour = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_PIXELS_PER_HOUR);
  const slotDurationMinutes = ref<SlotDurationMinutes>(
    SCHEDULE_VIEW_SETTINGS.DEFAULT_SLOT_DURATION as SlotDurationMinutes,
  );
  const workDaysPerWeek = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_WORK_DAYS_PER_WEEK);
  const maxPeoplePerSlot = ref<number>(SCHEDULE_VIEW_SETTINGS.DEFAULT_MAX_PEOPLE_PER_SLOT);
  const defaultView = ref<DefaultViewType>("week");
  const weekStart = ref<WeekStartOption>("locale");

  const settings = computed<SchedulerViewSettings>(() => ({
    startHour: startHour.value,
    endHour: endHour.value,
    pixelsPerHour: pixelsPerHour.value,
    slotDurationMinutes: slotDurationMinutes.value,
    workDaysPerWeek: workDaysPerWeek.value,
    maxPeoplePerSlot: maxPeoplePerSlot.value,
    defaultView: defaultView.value,
    weekStart: weekStart.value,
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
      workDaysPerWeek.value = clampWorkDaysPerWeek(stored.workDaysPerWeek ?? SCHEDULE_VIEW_SETTINGS.DEFAULT_WORK_DAYS_PER_WEEK);
      maxPeoplePerSlot.value = clampMaxPeoplePerSlot(stored.maxPeoplePerSlot ?? SCHEDULE_VIEW_SETTINGS.DEFAULT_MAX_PEOPLE_PER_SLOT);
      defaultView.value = stored.defaultView ?? "week";
      weekStart.value = stored.weekStart ?? "locale";
      if (startHour.value >= endHour.value) {
        endHour.value = Math.min(MAX_HOUR, startHour.value + 1);
      }
    } else {
      startHour.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_START_HOUR;
      endHour.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_END_HOUR;
      pixelsPerHour.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_PIXELS_PER_HOUR;
      slotDurationMinutes.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_SLOT_DURATION as SlotDurationMinutes;
      workDaysPerWeek.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_WORK_DAYS_PER_WEEK;
      maxPeoplePerSlot.value = SCHEDULE_VIEW_SETTINGS.DEFAULT_MAX_PEOPLE_PER_SLOT;
      defaultView.value = "week";
      weekStart.value = "locale";
    }
  }

  function updateSettings(updates: Partial<SchedulerViewSettings>) {
    if (updates.startHour !== undefined) startHour.value = clampHour(updates.startHour);
    if (updates.endHour !== undefined) endHour.value = clampHour(updates.endHour);
    if (updates.pixelsPerHour !== undefined) pixelsPerHour.value = clampPixels(updates.pixelsPerHour);
    if (updates.slotDurationMinutes !== undefined)
      slotDurationMinutes.value = clampSlotDuration(updates.slotDurationMinutes);
    if (updates.workDaysPerWeek !== undefined) workDaysPerWeek.value = clampWorkDaysPerWeek(updates.workDaysPerWeek);
    if (updates.maxPeoplePerSlot !== undefined) maxPeoplePerSlot.value = clampMaxPeoplePerSlot(updates.maxPeoplePerSlot);
    if (updates.defaultView !== undefined) defaultView.value = updates.defaultView;
    if (updates.weekStart !== undefined) weekStart.value = updates.weekStart;
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
    workDaysPerWeek,
    maxPeoplePerSlot,
    defaultView,
    weekStart,
    settings,
    initialize,
    updateSettings,
  };
});

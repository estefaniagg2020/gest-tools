import { defineStore } from "pinia";
import { computed } from "vue";
import type { DefaultViewType, SchedulerViewSettings, SlotDurationMinutes, WeekStartOption } from "@/interfaces";
import { useGestorConfigStore } from "./gestorConfig";
import { useAuthStore } from "./auth";
import {
  clampHour,
  clampPixels,
  clampSlotDuration,
  clampWorkDaysPerWeek,
  clampMaxPeoplePerSlot,
  MAX_HOUR,
} from "@/utils/schedulerSettingsValidation";

export const useSchedulerSettingsStore = defineStore("schedulerSettings", () => {
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();

  const startHour = computed(() => configStore.startHour);
  const endHour = computed(() => configStore.endHour);
  const pixelsPerHour = computed(() => configStore.pixelsPerHour);
  const slotDurationMinutes = computed(() => configStore.slotDurationMinutes as SlotDurationMinutes);
  const workDaysPerWeek = computed(() => configStore.workDaysPerWeek);
  const maxPeoplePerSlot = computed(() => configStore.maxPeoplePerSlot);
  const defaultView = computed(() => (configStore.defaultView as DefaultViewType) || "week");
  const weekStart = computed(() => (configStore.weekStart as WeekStartOption) || "locale");

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
    // Rely on gestorConfigStore.initialize() being called by the main App or layout
    // No specific local logic needed here as it's computed
  }

  async function updateSettings(updates: Partial<SchedulerViewSettings>) {
    const current = configStore.getConfig();
    const newConfig = {
      ...current,
      ...(updates.startHour !== undefined && { startHour: clampHour(updates.startHour) }),
      ...(updates.endHour !== undefined && { endHour: clampHour(updates.endHour) }),
      ...(updates.pixelsPerHour !== undefined && { pixelsPerHour: clampPixels(updates.pixelsPerHour) }),
      ...(updates.slotDurationMinutes !== undefined && { 
        slotDurationMinutes: clampSlotDuration(updates.slotDurationMinutes) 
      }),
      ...(updates.workDaysPerWeek !== undefined && { 
        workDaysPerWeek: clampWorkDaysPerWeek(updates.workDaysPerWeek) 
      }),
      ...(updates.maxPeoplePerSlot !== undefined && { 
        maxPeoplePerSlot: clampMaxPeoplePerSlot(updates.maxPeoplePerSlot) 
      }),
      ...(updates.defaultView !== undefined && { defaultView: updates.defaultView }),
      ...(updates.weekStart !== undefined && { weekStart: updates.weekStart }),
    };

    // Cross-validation
    if ((newConfig.startHour ?? 0) >= (newConfig.endHour ?? 0)) {
      newConfig.endHour = Math.min(MAX_HOUR, (newConfig.startHour ?? 0) + 1);
    }

    await configStore.setConfig(
      (authStore.user as any)?.id || authStore.currentUserId || "default",
      newConfig as any,
      (authStore.user as any)?.businessId
    );
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

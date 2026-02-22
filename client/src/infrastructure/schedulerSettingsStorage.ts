import type { SchedulerViewSettings } from "@/interfaces";

let memorySettings: SchedulerViewSettings | null = null;

const normalizeSlotDuration = (
  value: number,
): SchedulerViewSettings["slotDurationMinutes"] => {
  if (value === 30 || value === 60 || value === 90 || value === 120) {
    return value;
  }
  return 60;
};

export const loadSchedulerSettings = (): SchedulerViewSettings | null => {
  if (!memorySettings) return null;
  return {
    ...memorySettings,
    slotDurationMinutes: normalizeSlotDuration(memorySettings.slotDurationMinutes),
  };
};

export const saveSchedulerSettings = (
  settings: SchedulerViewSettings,
): void => {
  memorySettings = {
    ...settings,
    slotDurationMinutes: normalizeSlotDuration(settings.slotDurationMinutes),
  };
};

export const resetSchedulerSettingsStorage = (): void => {
  memorySettings = null;
};

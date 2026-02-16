import { storeToRefs } from "pinia";
import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";

export const useConfigAgenda = () => {
  const store = useSchedulerSettingsStore();
  const {
    startHour,
    endHour,
    slotDurationMinutes,
    workDaysPerWeek,
    maxPeoplePerSlot,
    defaultView,
  } = storeToRefs(store);

  const updateSettings = store.updateSettings;

  return {
    startHour,
    endHour,
    slotDurationMinutes,
    workDaysPerWeek,
    maxPeoplePerSlot,
    defaultView,
    updateSettings,
  };
};

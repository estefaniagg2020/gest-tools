import { storeToRefs } from "pinia";
import { useAgendaColorsStore } from "@/stores/agendaColors";

export const useAgendaColors = () => {
  const store = useAgendaColorsStore();
  const { sameColorsForAll, agendaBg, markedDaysColor, vacationColor, perAgendaColors, globalSet } =
    storeToRefs(store);
  return {
    sameColorsForAll,
    agendaBg,
    markedDaysColor,
    vacationColor,
    perAgendaColors,
    globalSet,
    getColorsForAgenda: store.getColorsForAgenda,
    initialize: store.initialize,
    updateColors: store.updateColors,
    setAgendaColorsForIndex: store.setAgendaColorsForIndex,
    ensurePerAgendaColorsLength: store.ensurePerAgendaColorsLength,
    resetToThemeDefaults: store.resetToThemeDefaults,
  };
};

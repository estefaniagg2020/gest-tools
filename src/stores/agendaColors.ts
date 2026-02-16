import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { AgendaColorSet, AgendaColorsConfig } from "@/interfaces/agendaColors";
import { loadAgendaColorsConfig, saveAgendaColorsConfig } from "@/infrastructure/agendaColorsStorage";
import { useThemeStore } from "@/stores/theme";
import { getDefaultAgendaColorsForTheme } from "@/data/agendaColorDefaults";
import { normalizeAgendaColorsConfig } from "@/utils/agendaColorsValidation";

const CSS_VARS = {
  agendaBg: "--agenda-bg",
  markedDaysColor: "--agenda-marked-days",
  vacationColor: "--agenda-vacation",
} as const;

const applyColorsToDocument = (set: AgendaColorSet) => {
  const root = document.documentElement;
  root.style.setProperty(CSS_VARS.agendaBg, set.agendaBg);
  root.style.setProperty(CSS_VARS.markedDaysColor, set.markedDaysColor);
  root.style.setProperty(CSS_VARS.vacationColor, set.vacationColor);
};

const globalSetFromRefs = (
  agendaBg: string,
  markedDaysColor: string,
  vacationColor: string,
): AgendaColorSet => ({ agendaBg, markedDaysColor, vacationColor });

export const useAgendaColorsStore = defineStore("agendaColors", () => {
  const sameColorsForAll = ref(true);
  const agendaBg = ref("#ffffff");
  const markedDaysColor = ref("#017074");
  const vacationColor = ref("#db7f50");
  const perAgendaColors = ref<AgendaColorSet[]>([]);

  const globalSet = computed(() =>
    globalSetFromRefs(agendaBg.value, markedDaysColor.value, vacationColor.value),
  );

  const getColorsForAgenda = (index: number): AgendaColorSet => {
    if (sameColorsForAll.value) return globalSet.value;
    const per = perAgendaColors.value[index];
    return per ?? globalSet.value;
  };

  const initialize = () => {
    const themeStore = useThemeStore();
    const themeDefaults = getDefaultAgendaColorsForTheme(themeStore.themeId);
    const stored = loadAgendaColorsConfig();
    if (stored) {
      const normalized = normalizeAgendaColorsConfig(stored, themeDefaults);
      sameColorsForAll.value = normalized.sameColorsForAll;
      agendaBg.value = normalized.agendaBg;
      markedDaysColor.value = normalized.markedDaysColor;
      vacationColor.value = normalized.vacationColor;
      perAgendaColors.value = normalized.perAgendaColors ?? [];
    } else {
      sameColorsForAll.value = themeDefaults.sameColorsForAll;
      agendaBg.value = themeDefaults.agendaBg;
      markedDaysColor.value = themeDefaults.markedDaysColor;
      vacationColor.value = themeDefaults.vacationColor;
      perAgendaColors.value = [];
    }
    const setToApply = sameColorsForAll.value
      ? globalSetFromRefs(agendaBg.value, markedDaysColor.value, vacationColor.value)
      : (perAgendaColors.value[0] ?? globalSetFromRefs(agendaBg.value, markedDaysColor.value, vacationColor.value));
    applyColorsToDocument(setToApply);
  };

  const persistAndApply = () => {
    const config: AgendaColorsConfig = {
      sameColorsForAll: sameColorsForAll.value,
      agendaBg: agendaBg.value,
      markedDaysColor: markedDaysColor.value,
      vacationColor: vacationColor.value,
      perAgendaColors: perAgendaColors.value.length > 0 ? perAgendaColors.value : undefined,
    };
    saveAgendaColorsConfig(config);
    const setToApply = sameColorsForAll.value
      ? globalSet.value
      : (perAgendaColors.value[0] ?? globalSet.value);
    applyColorsToDocument(setToApply);
  };

  const updateColors = (updates: Partial<AgendaColorsConfig>) => {
    if (updates.sameColorsForAll !== undefined) sameColorsForAll.value = updates.sameColorsForAll;
    if (updates.agendaBg !== undefined) agendaBg.value = updates.agendaBg;
    if (updates.markedDaysColor !== undefined) markedDaysColor.value = updates.markedDaysColor;
    if (updates.vacationColor !== undefined) vacationColor.value = updates.vacationColor;
    if (updates.perAgendaColors !== undefined) perAgendaColors.value = updates.perAgendaColors;
    persistAndApply();
  };

  const setAgendaColorsForIndex = (index: number, set: Partial<AgendaColorSet>) => {
    const current = perAgendaColors.value[index] ?? globalSet.value;
    const next = [...perAgendaColors.value];
    next[index] = {
      agendaBg: set.agendaBg ?? current.agendaBg,
      markedDaysColor: set.markedDaysColor ?? current.markedDaysColor,
      vacationColor: set.vacationColor ?? current.vacationColor,
    };
    perAgendaColors.value = next;
    persistAndApply();
  };

  const ensurePerAgendaColorsLength = (count: number) => {
    if (count <= 0) return;
    const g = globalSet.value;
    const next = [...perAgendaColors.value];
    while (next.length < count) next.push({ ...g });
    if (next.length > count) next.splice(count);
    perAgendaColors.value = next;
    persistAndApply();
  };

  const resetToThemeDefaults = () => {
    const themeStore = useThemeStore();
    const defaults = getDefaultAgendaColorsForTheme(themeStore.themeId);
    sameColorsForAll.value = defaults.sameColorsForAll;
    agendaBg.value = defaults.agendaBg;
    markedDaysColor.value = defaults.markedDaysColor;
    vacationColor.value = defaults.vacationColor;
    perAgendaColors.value = [];
    persistAndApply();
  };

  return {
    sameColorsForAll,
    agendaBg,
    markedDaysColor,
    vacationColor,
    perAgendaColors,
    globalSet,
    getColorsForAgenda,
    initialize,
    updateColors,
    setAgendaColorsForIndex,
    ensurePerAgendaColorsLength,
    resetToThemeDefaults,
  };
});

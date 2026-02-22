import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { AgendaColorSet, AgendaColorsConfig } from "@/interfaces/agendaColors";
import { agendaColorsApi } from "@/infrastructure/agendaColorsApi";
import { useThemeStore } from "@/stores/theme";
import { getDefaultAgendaColorsForTheme } from "@/data/agendaColorDefaults";
import { normalizeAgendaColorsConfig } from "@/utils/agendaColorsValidation";

const CSS_VARS = {
  agendaBg: "--agenda-bg",
  markedDaysColor: "--agenda-marked-days",
  vacationColor: "--agenda-vacation",
} as const;

const DARK_AGENDA_BG = "#1e293b";

const isDarkMode = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark");

const applyColorsToDocument = (set: AgendaColorSet) => {
  const root = document.documentElement;
  const bg = isDarkMode() ? DARK_AGENDA_BG : set.agendaBg;
  root.style.setProperty(CSS_VARS.agendaBg, bg);
  root.style.setProperty(CSS_VARS.markedDaysColor, set.markedDaysColor);
  root.style.setProperty(CSS_VARS.vacationColor, set.vacationColor);
};

const globalSetFromRefs = (
  agendaBg: string,
  markedDaysColor: string,
  vacationColor: string,
): AgendaColorSet => ({ agendaBg, markedDaysColor, vacationColor });

export const useAgendaColorsStore = defineStore("agendaColors", () => {
  const businessId = ref<string | null>(null);

  const sameColorsForAll = ref(true);
  const agendaBg = ref("#ffffff");
  const markedDaysColor = ref("#008080");
  const vacationColor = ref("#006d6d");
  const perAgendaColors = ref<AgendaColorSet[]>([]);

  const globalSet = computed(() =>
    globalSetFromRefs(agendaBg.value, markedDaysColor.value, vacationColor.value),
  );

  const getColorsForAgenda = (index: number): AgendaColorSet => {
    if (sameColorsForAll.value) return globalSet.value;
    const per = perAgendaColors.value[index];
    return per ?? globalSet.value;
  };

  const applyCurrentColors = () => {
    const setToApply = sameColorsForAll.value
      ? globalSetFromRefs(agendaBg.value, markedDaysColor.value, vacationColor.value)
      : (perAgendaColors.value[0] ?? globalSetFromRefs(agendaBg.value, markedDaysColor.value, vacationColor.value));
    applyColorsToDocument(setToApply);
  };

  const saveToApi = () => {
    if (!businessId.value) return;
    const config: AgendaColorsConfig = {
      sameColorsForAll: sameColorsForAll.value,
      agendaBg: agendaBg.value,
      markedDaysColor: markedDaysColor.value,
      vacationColor: vacationColor.value,
      perAgendaColors: perAgendaColors.value.length > 0 ? perAgendaColors.value : undefined,
    };
    agendaColorsApi.save(businessId.value, config).catch(() => {});
  };

  const initialize = async (bId: string | null) => {
    businessId.value = bId;
    const themeStore = useThemeStore();
    const themeDefaults = getDefaultAgendaColorsForTheme(themeStore.themeId);

    if (bId) {
      try {
        const stored = await agendaColorsApi.load(bId);
        if (stored) {
          const normalized = normalizeAgendaColorsConfig(stored, themeDefaults);
          sameColorsForAll.value = normalized.sameColorsForAll;
          agendaBg.value = normalized.agendaBg;
          markedDaysColor.value = normalized.markedDaysColor;
          vacationColor.value = normalized.vacationColor;
          perAgendaColors.value = normalized.perAgendaColors ?? [];
          applyCurrentColors();
          return;
        }
      } catch {
        // fall through to theme defaults
      }
    }

    sameColorsForAll.value = themeDefaults.sameColorsForAll;
    agendaBg.value = themeDefaults.agendaBg;
    markedDaysColor.value = themeDefaults.markedDaysColor;
    vacationColor.value = themeDefaults.vacationColor;
    perAgendaColors.value = [];
    applyCurrentColors();
  };

  const reapply = () => applyCurrentColors();

  watch(
    () => useThemeStore().colorMode,
    () => reapply(),
    { flush: "post" },
  );

  const persistAndApply = () => {
    saveToApi();
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

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { i18n } from "@/i18n";
import type { AgendaEntry, AgendaListConfig } from "@/interfaces/agendaList";
import { loadAgendaListConfig, saveAgendaListConfig } from "@/infrastructure/agendaListStorage";
import { AGENDA_LIST } from "@/data/constants";
import {
  clampNumberOfAgendas,
  ensureAgendasLength,
} from "@/utils/agendaListValidation";

export const useAgendaListStore = defineStore("agendaList", () => {
  const numberOfAgendas = ref<number>(AGENDA_LIST.DEFAULT_AGENDAS);
  const agendas = ref<AgendaEntry[]>([]);

  const agendaNames = computed(() => agendas.value.map((a) => a.name));

  const getDefaultNamePrefix = () =>
    i18n.global.t("scheduler.defaultAgendaName") as string;

  const initialize = () => {
    const stored = loadAgendaListConfig();
    const prefix = getDefaultNamePrefix();
    if (stored) {
      numberOfAgendas.value = clampNumberOfAgendas(stored.numberOfAgendas);
      agendas.value = ensureAgendasLength(stored.agendas, numberOfAgendas.value, prefix);
    } else {
      numberOfAgendas.value = AGENDA_LIST.DEFAULT_AGENDAS;
      agendas.value = ensureAgendasLength([], AGENDA_LIST.DEFAULT_AGENDAS, prefix);
    }
  };

  const persist = () => {
    saveAgendaListConfig({ numberOfAgendas: numberOfAgendas.value, agendas: agendas.value });
  };

  const updateAgendaList = (updates: Partial<AgendaListConfig>) => {
    const prefix = getDefaultNamePrefix();
    if (updates.numberOfAgendas !== undefined) {
      numberOfAgendas.value = clampNumberOfAgendas(updates.numberOfAgendas);
      agendas.value = ensureAgendasLength(agendas.value, numberOfAgendas.value, prefix);
    }
    if (updates.agendas !== undefined) {
      agendas.value = ensureAgendasLength(updates.agendas, numberOfAgendas.value, prefix);
    }
    persist();
  };

  const setAgendaName = (index: number, name: string) => {
    if (index < 0 || index >= agendas.value.length) return;
    const next = [...agendas.value];
    const prefix = getDefaultNamePrefix();
    next[index] = {
      ...next[index],
      name: name.trim() !== "" ? name : `${prefix} ${index + 1}`,
    };
    agendas.value = next;
    persist();
  };

  const setAgendaHours = (index: number, startHour?: number, endHour?: number) => {
    if (index < 0 || index >= agendas.value.length) return;
    const next = [...agendas.value];
    next[index] = {
      ...next[index],
      startHour: startHour ?? undefined,
      endHour: endHour ?? undefined,
    };
    agendas.value = next;
    persist();
  };

  const setAgendaWorkDays = (index: number, workDaysPerWeek?: number) => {
    if (index < 0 || index >= agendas.value.length) return;
    const next = [...agendas.value];
    next[index] = {
      ...next[index],
      workDaysPerWeek: workDaysPerWeek ?? undefined,
    };
    agendas.value = next;
    persist();
  };

  const getAgenda = (index: number): AgendaEntry | undefined => agendas.value[index];

  return {
    numberOfAgendas,
    agendas,
    agendaNames,
    initialize,
    updateAgendaList,
    setAgendaName,
    setAgendaHours,
    setAgendaWorkDays,
    getAgenda,
  };
});

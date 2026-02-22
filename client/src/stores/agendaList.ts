import { defineStore } from "pinia";
import { computed } from "vue";
import { i18n } from "@/i18n";
import type { AgendaEntry, AgendaListConfig } from "@/interfaces/agendaList";
import { useGestorConfigStore } from "./gestorConfig";
import { useAuthStore } from "./auth";
import { AGENDA_LIST } from "@/data/constants";
import {
  clampNumberOfAgendas,
  ensureAgendasLength,
} from "@/utils/agendaListValidation";

export const useAgendaListStore = defineStore("agendaList", () => {
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();

  const config = computed<AgendaListConfig>(() => {
    const raw = configStore.agendaListConfig;
    if (raw && typeof raw === "object") {
      return raw as AgendaListConfig;
    }
    return {
      numberOfAgendas: AGENDA_LIST.DEFAULT_AGENDAS,
      agendas: [],
    };
  });

  const numberOfAgendas = computed(() => clampNumberOfAgendas(config.value.numberOfAgendas));
  const agendas = computed(() => {
    const prefix = i18n.global.t("scheduler.defaultAgendaName") as string;
    return ensureAgendasLength(config.value.agendas || [], numberOfAgendas.value, prefix);
  });

  const agendaNames = computed(() => agendas.value.map((a) => a.name));

  const initialize = () => {
    // Initialized by gestorConfigStore
  };

  const persist = async (newConfig: AgendaListConfig) => {
    const currentFullConfig = configStore.getConfig();
    await configStore.setConfig(
      (authStore.user as any)?.id || authStore.currentUserId || "default",
      { ...currentFullConfig, agendaListConfig: newConfig },
      (authStore.user as any)?.businessId
    );
  };

  const updateAgendaList = async (updates: Partial<AgendaListConfig>) => {
    const nextConfig: AgendaListConfig = {
      numberOfAgendas: updates.numberOfAgendas ?? numberOfAgendas.value,
      agendas: updates.agendas ?? agendas.value,
    };
    await persist(nextConfig);
  };

  const setAgendaName = async (index: number, name: string) => {
    const nextAgendas = [...agendas.value];
    const prefix = i18n.global.t("scheduler.defaultAgendaName") as string;
    nextAgendas[index] = {
      ...nextAgendas[index],
      name: name.trim() !== "" ? name : `${prefix} ${index + 1}`,
    };
    await persist({ numberOfAgendas: numberOfAgendas.value, agendas: nextAgendas });
  };

  const setAgendaHours = async (index: number, startHour?: number, endHour?: number) => {
    const nextAgendas = [...agendas.value];
    nextAgendas[index] = {
      ...nextAgendas[index],
      startHour: startHour ?? undefined,
      endHour: endHour ?? undefined,
    };
    await persist({ numberOfAgendas: numberOfAgendas.value, agendas: nextAgendas });
  };

  const setAgendaWorkDays = async (index: number, workDaysPerWeek?: number) => {
    const nextAgendas = [...agendas.value];
    nextAgendas[index] = {
      ...nextAgendas[index],
      workDaysPerWeek: workDaysPerWeek ?? undefined,
    };
    await persist({ numberOfAgendas: numberOfAgendas.value, agendas: nextAgendas });
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

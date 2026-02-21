import type { AgendaColorsConfig } from "@/interfaces/agendaColors";
import { businessConfigApi } from "./businessConfigApi";

export const agendaColorsApi = {
  load: async (businessId: string): Promise<Record<string, unknown> | null> => {
    const config = await businessConfigApi.getConfig(businessId);
    if (!config) return null;
    const { sameColorsForAll, agendaBg, markedDaysColor, vacationColor, perAgendaColors } = config;
    if (agendaBg === undefined && markedDaysColor === undefined && vacationColor === undefined) return null;
    return { sameColorsForAll, agendaBg, markedDaysColor, vacationColor, perAgendaColors };
  },

  save: async (businessId: string, config: AgendaColorsConfig): Promise<void> => {
    await businessConfigApi.updateConfig(businessId, config);
  },
};

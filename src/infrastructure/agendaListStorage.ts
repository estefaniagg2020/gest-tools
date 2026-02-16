import type { AgendaListConfig } from "@/interfaces/agendaList";
import { normalizeAgendaListConfig } from "@/utils/agendaListValidation";

const KEY = "spa-agenda-list-config";

export const loadAgendaListConfig = (): AgendaListConfig | null => {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && ("numberOfAgendas" in parsed || "agendas" in parsed)) {
      return normalizeAgendaListConfig(parsed as Record<string, unknown>);
    }
    return null;
  } catch {
    return null;
  }
};

export const saveAgendaListConfig = (config: AgendaListConfig): void => {
  localStorage.setItem(KEY, JSON.stringify(config));
};

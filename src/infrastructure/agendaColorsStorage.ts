import type { AgendaColorsConfig } from "@/interfaces/agendaColors";

const KEY = "spa-agenda-colors-config";

export const loadAgendaColorsConfig = (): Record<string, unknown> | null => {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
};

export const saveAgendaColorsConfig = (config: AgendaColorsConfig): void => {
  localStorage.setItem(KEY, JSON.stringify(config));
};

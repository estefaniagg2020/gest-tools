import type { AgendaEntry, AgendaListConfig } from "@/interfaces/agendaList";
import { AGENDA_LIST } from "@/data/constants";
import { clampHour } from "@/utils/schedulerSettingsValidation";

export const clampNumberOfAgendas = (n: number): number =>
  Math.max(AGENDA_LIST.MIN_AGENDAS, Math.min(AGENDA_LIST.MAX_AGENDAS, Math.floor(n)));

const clampOptionalHour = (h: unknown): number | undefined => {
  if (typeof h !== "number" || Number.isNaN(h)) return undefined;
  return clampHour(h);
};

const clampWorkDays = (d: unknown): number | undefined => {
  if (typeof d !== "number" || Number.isNaN(d)) return undefined;
  const n = Math.floor(d);
  return n >= 1 && n <= 7 ? n : undefined;
};

const defaultEntry = (index: number, prefix?: string): AgendaEntry => ({
  name: `${prefix ?? AGENDA_LIST.DEFAULT_NAME_PREFIX} ${index + 1}`,
  startHour: undefined,
  endHour: undefined,
  workDaysPerWeek: undefined,
});

export const normalizeAgendaEntry = (raw: unknown, index: number, prefix?: string): AgendaEntry => {
  const fallback = `${prefix ?? AGENDA_LIST.DEFAULT_NAME_PREFIX} ${index + 1}`;
  if (raw && typeof raw === "object" && "name" in raw) {
    const name = typeof (raw as { name: unknown }).name === "string"
      ? (raw as { name: string }).name.trim() || fallback
      : fallback;
    const startHour = clampOptionalHour((raw as Record<string, unknown>).startHour);
    const endHour = clampOptionalHour((raw as Record<string, unknown>).endHour);
    const workDaysPerWeek = clampWorkDays((raw as Record<string, unknown>).workDaysPerWeek);
    return { name, startHour, endHour, workDaysPerWeek };
  }
  return defaultEntry(index, prefix);
};

export const ensureAgendasLength = (
  agendas: AgendaEntry[],
  count: number,
  prefix?: string,
): AgendaEntry[] => {
  const fallback = (i: number) => `${prefix ?? AGENDA_LIST.DEFAULT_NAME_PREFIX} ${i + 1}`;
  const result: AgendaEntry[] = agendas.slice(0, count).map((a, i) => ({
    name: (a.name && String(a.name).trim()) || fallback(i),
    startHour: clampOptionalHour(a.startHour) ?? undefined,
    endHour: clampOptionalHour(a.endHour) ?? undefined,
    workDaysPerWeek: clampWorkDays(a.workDaysPerWeek) ?? undefined,
  }));
  while (result.length < count) {
    result.push(defaultEntry(result.length, prefix));
  }
  return result;
};

export const normalizeAgendaListConfig = (raw: Record<string, unknown>): AgendaListConfig => {
  const count = clampNumberOfAgendas(
    typeof raw.numberOfAgendas === "number" ? raw.numberOfAgendas : AGENDA_LIST.DEFAULT_AGENDAS,
  );
  if (Array.isArray(raw.agendas) && raw.agendas.length > 0) {
    const agendas = ensureAgendasLength(
      raw.agendas.map((a, i) => normalizeAgendaEntry(a, i)),
      count,
    );
    return { numberOfAgendas: count, agendas };
  }
  const rawNames = Array.isArray(raw.agendaNames) ? raw.agendaNames : [];
  const agendas: AgendaEntry[] = Array.from({ length: count }, (_, i) => {
    const name = typeof rawNames[i] === "string" ? String(rawNames[i]).trim() : "";
    return {
      name: name || `${AGENDA_LIST.DEFAULT_NAME_PREFIX} ${i + 1}`,
      startHour: undefined,
      endHour: undefined,
      workDaysPerWeek: undefined,
    };
  });
  return { numberOfAgendas: count, agendas };
};

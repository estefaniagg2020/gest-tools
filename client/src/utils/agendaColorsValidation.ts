import type { AgendaColorSet, AgendaColorsConfig } from "@/interfaces/agendaColors";
import { HEX_REGEX } from "@/interfaces/agendaColors";

const isValidHex = (s: unknown): s is string =>
  typeof s === "string" && HEX_REGEX.test(s);

export const normalizeHex = (value: unknown, fallback: string): string => {
  if (isValidHex(value)) return value;
  return fallback;
};

const normalizeColorSet = (raw: unknown, fallback: AgendaColorSet): AgendaColorSet => {
  if (raw && typeof raw === "object" && "agendaBg" in raw) {
    const o = raw as Record<string, unknown>;
    return {
      agendaBg: normalizeHex(o.agendaBg, fallback.agendaBg),
      markedDaysColor: normalizeHex(o.markedDaysColor, fallback.markedDaysColor),
      vacationColor: normalizeHex(o.vacationColor, fallback.vacationColor),
    };
  }
  return fallback;
};

export const normalizeAgendaColorsConfig = (
  raw: Record<string, unknown>,
  themeDefaults: AgendaColorsConfig,
): AgendaColorsConfig => {
  const agendaBg = normalizeHex(raw.agendaBg, themeDefaults.agendaBg);
  const markedDaysColor = normalizeHex(raw.markedDaysColor, themeDefaults.markedDaysColor);
  const vacationColor = normalizeHex(raw.vacationColor, themeDefaults.vacationColor);
  const globalSet: AgendaColorSet = { agendaBg, markedDaysColor, vacationColor };
  let perAgendaColors: AgendaColorSet[] | undefined;
  if (Array.isArray(raw.perAgendaColors) && raw.perAgendaColors.length > 0) {
    perAgendaColors = raw.perAgendaColors.map((item) =>
      normalizeColorSet(item, globalSet),
    );
  }
  return {
    sameColorsForAll:
      typeof raw.sameColorsForAll === "boolean" ? raw.sameColorsForAll : themeDefaults.sameColorsForAll,
    agendaBg,
    markedDaysColor,
    vacationColor,
    perAgendaColors,
  };
};

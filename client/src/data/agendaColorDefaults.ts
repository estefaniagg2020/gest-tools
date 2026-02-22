import type { AgendaColorsConfig } from "@/interfaces/agendaColors";

type ThemeAgendaDefaults = Omit<AgendaColorsConfig, "sameColorsForAll">;

const BY_THEME: Record<string, ThemeAgendaDefaults> = {
  "minimal-premium": {
    agendaBg: "#ffffff",
    markedDaysColor: "#6d28d9",
    vacationColor: "#7c3aed",
  },
  amarillo: {
    agendaBg: "#ffffff",
    markedDaysColor: "#a16207",
    vacationColor: "#ca8a04",
  },
  verde: {
    agendaBg: "#ffffff",
    markedDaysColor: "#15803d",
    vacationColor: "#16a34a",
  },
  azul: {
    agendaBg: "#ffffff",
    markedDaysColor: "#187bcd",
    vacationColor: "#0a6fb4",
  },
  "azul-oscuro": {
    agendaBg: "#ffffff",
    markedDaysColor: "#38bdf8",
    vacationColor: "#0ea5e9",
  },
  rojo: {
    agendaBg: "#ffffff",
    markedDaysColor: "#dc2626",
    vacationColor: "#ef4444",
  },
  teal: {
    agendaBg: "#ffffff",
    markedDaysColor: "#008080",
    vacationColor: "#006d6d",
  },
  claro: {
    agendaBg: "#ffffff",
    markedDaysColor: "#0d9488",
    vacationColor: "#4f46e5",
  },
  oscuro: {
    agendaBg: "#1f2937",
    markedDaysColor: "#2dd4bf",
    vacationColor: "#f59e0b",
  },
  oceano: {
    agendaBg: "#f0f9ff",
    markedDaysColor: "#0369a1",
    vacationColor: "#0ea5e9",
  },
  bosque: {
    agendaBg: "#f7fee7",
    markedDaysColor: "#15803d",
    vacationColor: "#65a30d",
  },
  atardecer: {
    agendaBg: "#fff7ed",
    markedDaysColor: "#c2410c",
    vacationColor: "#ea580c",
  },
  lavanda: {
    agendaBg: "#f5f3ff",
    markedDaysColor: "#6d28d9",
    vacationColor: "#7c3aed",
  },
  coral: {
    agendaBg: "#fff1f2",
    markedDaysColor: "#be123c",
    vacationColor: "#e11d48",
  },
  indigo: {
    agendaBg: "#eef2ff",
    markedDaysColor: "#3730a3",
    vacationColor: "#4f46e5",
  },
  rosa: {
    agendaBg: "#fdf2f8",
    markedDaysColor: "#be185d",
    vacationColor: "#db2777",
  },
  minimal: {
    agendaBg: "#ffffff",
    markedDaysColor: "#404040",
    vacationColor: "#525252",
  },
  arena: {
    agendaBg: "#fefce8",
    markedDaysColor: "#a16207",
    vacationColor: "#b45309",
  },
  esmeralda: {
    agendaBg: "#ecfdf5",
    markedDaysColor: "#047857",
    vacationColor: "#059669",
  },
  personalizado: {
    agendaBg: "#ffffff",
    markedDaysColor: "#008080",
    vacationColor: "#006d6d",
  },
};

const FALLBACK: ThemeAgendaDefaults = {
  agendaBg: "#ffffff",
  markedDaysColor: "#008080",
  vacationColor: "#006d6d",
};

export const getDefaultAgendaColorsForTheme = (themeId: string): AgendaColorsConfig => {
  const themeDefaults = BY_THEME[themeId] ?? FALLBACK;
  return {
    sameColorsForAll: true,
    ...themeDefaults,
  };
};

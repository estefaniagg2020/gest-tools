import type { ServiceCategoryDefinition } from "@/interfaces";

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategoryDefinition[] = [
  { id: "manual", label: "Tratamientos manuales", icon: "🤲" },
  { id: "hydrotherapy", label: "Hidroterapia", icon: "💧" },
  { id: "aesthetic", label: "Estética", icon: "💅" },
  { id: "wellness", label: "Bienestar", icon: "🧘" },
];

const ACCENT_BY_INDEX = [
  "bg-amber-100 text-amber-800 shadow-amber-200/50",
  "bg-sky-100 text-sky-800 shadow-sky-200/50",
  "bg-pink-100 text-pink-800 shadow-pink-200/50",
  "bg-emerald-100 text-emerald-800 shadow-emerald-200/50",
];

const BORDER_BY_INDEX = [
  "border-l-4 border-l-amber-400",
  "border-l-4 border-l-sky-400",
  "border-l-4 border-l-pink-400",
  "border-l-4 border-l-emerald-400",
];

export const getCategoryAccentClass = (index: number): string =>
  ACCENT_BY_INDEX[index % ACCENT_BY_INDEX.length] ?? "bg-slate-100 text-slate-600";

export const getCategoryBorderClass = (index: number): string =>
  BORDER_BY_INDEX[index % BORDER_BY_INDEX.length] ?? "";
import type { ServiceCategoryDefinition } from "@/interfaces";

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategoryDefinition[] = [
  { id: "general", label: "General", icon: "📋" },
];

const ACCENT_BY_INDEX = [
  "bg-amber-100 text-amber-800 shadow-amber-200/50 dark:bg-amber-500/20 dark:text-amber-100 dark:shadow-amber-900/30",
  "bg-sky-100 text-sky-800 shadow-sky-200/50 dark:bg-sky-500/20 dark:text-sky-100 dark:shadow-sky-900/30",
  "bg-pink-100 text-pink-800 shadow-pink-200/50 dark:bg-pink-500/20 dark:text-pink-100 dark:shadow-pink-900/30",
  "bg-emerald-100 text-emerald-800 shadow-emerald-200/50 dark:bg-emerald-500/20 dark:text-emerald-100 dark:shadow-emerald-900/30",
];

const BORDER_BY_INDEX = [
  "border-l-4 border-l-amber-400 dark:border-l-amber-500",
  "border-l-4 border-l-sky-400 dark:border-l-sky-500",
  "border-l-4 border-l-pink-400 dark:border-l-pink-500",
  "border-l-4 border-l-emerald-400 dark:border-l-emerald-500",
];

export const getCategoryAccentClass = (index: number): string =>
  ACCENT_BY_INDEX[index % ACCENT_BY_INDEX.length] ?? "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-200";

export const getCategoryBorderClass = (index: number): string =>
  BORDER_BY_INDEX[index % BORDER_BY_INDEX.length] ?? "";
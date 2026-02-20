import { i18n } from "@/i18n";
import type { WeekStartOption } from "@/interfaces";

const LOCALE_MAP: Record<string, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-GB",
  de: "de-DE",
};

export const getI18nLocaleCode = (): string => i18n.global.locale.value as unknown as string;

export const getIntlLocale = (): string => {
  const code = getI18nLocaleCode();
  return LOCALE_MAP[code] ?? code;
};

export const resolveWeekStartsOn = (weekStart: WeekStartOption, localeCode: string): 0 | 1 => {
  if (weekStart === "sunday") return 0;
  if (weekStart === "monday") return 1;
  return localeCode === "en" ? 0 : 1;
};


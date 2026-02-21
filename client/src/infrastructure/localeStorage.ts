export type LocaleCode = "es" | "ca" | "en" | "de";

const LOCALE_KEY = "gestor-locale";

const VALID_LOCALES: LocaleCode[] = ["es", "ca", "en", "de"];

const isValidLocale = (v: unknown): v is LocaleCode =>
  typeof v === "string" && VALID_LOCALES.includes(v as LocaleCode);

export const localeStorage = {
  get(): LocaleCode | null {
    try {
      const raw = localStorage.getItem(LOCALE_KEY);
      return raw && isValidLocale(raw) ? (raw as LocaleCode) : null;
    } catch {
      return null;
    }
  },

  set(locale: LocaleCode): void {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* ignore */
    }
  },
};

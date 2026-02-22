export type LocaleCode = "es" | "ca" | "en" | "de";

const VALID_LOCALES: LocaleCode[] = ["es", "ca", "en", "de"];

const isValidLocale = (v: unknown): v is LocaleCode =>
  typeof v === "string" && VALID_LOCALES.includes(v as LocaleCode);

let memoryLocale: LocaleCode | null = null;

const fromNavigator = (): LocaleCode | null => {
  const language =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  if (language.startsWith("es")) return "es";
  if (language.startsWith("ca")) return "ca";
  if (language.startsWith("de")) return "de";
  if (language.startsWith("en")) return "en";
  return null;
};

export const localeStorage = {
  get(): LocaleCode | null {
    if (memoryLocale && isValidLocale(memoryLocale)) return memoryLocale;
    return fromNavigator() ?? "es";
  },

  set(locale: LocaleCode): void {
    memoryLocale = isValidLocale(locale) ? locale : null;
  },
};

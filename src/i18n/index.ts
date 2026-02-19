import { createI18n } from "vue-i18n";
import type { LocaleCode } from "@/infrastructure/localeStorage";
import { localeStorage } from "@/infrastructure/localeStorage";

import es from "./locales/es.json";
import ca from "./locales/ca.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

const messages = {
  es,
  ca,
  en,
  de,
};

const initialLocale = (localeStorage.get() ?? "es") as LocaleCode;

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: "es",
  messages,
});

export const setI18nLocale = (code: LocaleCode): void => {
  i18n.global.locale.value = code;
};

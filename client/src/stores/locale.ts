import { defineStore } from "pinia";
import { ref } from "vue";
import { localeStorage, type LocaleCode } from "@/infrastructure/localeStorage";
import { setI18nLocale } from "@/i18n";

const DEFAULT_LOCALE: LocaleCode = "es";

export const useLocaleStore = defineStore("locale", () => {
  const locale = ref<LocaleCode>(
    localeStorage.get() ?? DEFAULT_LOCALE,
  );

  const setLocale = (code: LocaleCode) => {
    locale.value = code;
    localeStorage.set(code);
    setI18nLocale(code);
  };

  return {
    locale,
    setLocale,
  };
});

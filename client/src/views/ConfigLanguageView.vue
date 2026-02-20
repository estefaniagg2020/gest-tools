<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <ConfigPageHeader
        :title="$t('configIdioma.title')"
        :description="$t('configIdioma.description')"
        :back-to="{ name: 'config' }"
        :back-label="$t('common.backToConfig')"
      />

      <div class="mt-8 rounded-xl border border-app-border-subtle bg-app-surface p-6">
        <h2 class="text-base font-semibold text-app-title mb-4">
          {{ $t('configIdioma.title') }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="opt in localeOptions"
            :key="opt.code"
            type="button"
            class="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200"
            :class="localeStore.locale === opt.code
              ? 'border-brand-accent bg-brand-accent/10 ring-2 ring-brand-accent/30'
              : 'border-app-border-subtle bg-app-bg hover:border-app-border hover:bg-app-surface'"
            @click="selectLocale(opt.code)"
          >
            <span class="text-2xl" aria-hidden="true">{{ opt.flag }}</span>
            <div>
              <span class="font-medium text-app-title">{{ opt.label }}</span>
              <span class="block text-sm text-app-text/70">{{ opt.native }}</span>
            </div>
            <span
              v-if="localeStore.locale === opt.code"
              class="ml-auto text-brand-accent"
              aria-hidden="true"
            >
              ✓
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import type { LocaleCode } from "@/infrastructure/localeStorage";
  import { useLocaleStore } from "@/stores/locale";
  import ConfigPageHeader from "@/components/config/ConfigPageHeader.vue";

  const localeStore = useLocaleStore();
  const { t } = useI18n();

  const localeOptions = computed(() => [
    { code: "es" as LocaleCode, label: t("configIdioma.spanish"), native: "Español", flag: "🇪🇸" },
    { code: "ca" as LocaleCode, label: t("configIdioma.catalan"), native: "Català", flag: "🇪🇸" },
    { code: "en" as LocaleCode, label: t("configIdioma.english"), native: "English", flag: "🇬🇧" },
    { code: "de" as LocaleCode, label: t("configIdioma.german"), native: "Deutsch", flag: "🇩🇪" },
  ]);

  const selectLocale = (code: LocaleCode) => {
    localeStore.setLocale(code);
  };
</script>

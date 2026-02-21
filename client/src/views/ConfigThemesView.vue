<template>
  <div class="config-temas-page min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <ConfigPageHeader
        :title="$t('configTemas.title')"
        :description="$t('configTemas.description')"
        :back-to="{ name: 'config' }"
        :back-label="$t('common.backToConfig')"
      />

      <ColorModePicker
        :model-value="colorMode"
        :options="colorModeOptions"
        @update:model-value="themeStore.setColorMode"
      />

      <ThemePreviewSection
        :primary-color="markedDaysColor"
        :secondary-color="vacationColor"
        :bg-color="agendaBg"
        :preview-key="previewKey"
      />

      <div class="mt-8">
        <ThemeDefaultsButton @click="handleValoresPorDefecto" />
      </div>

      <ThemeGrid
        :options="(picker.options as readonly ThemeGridOption[])"
        :selected-id="themeId"
        :primary-color-for-custom="primaryColor"
        @select="onSelectTheme"
      />

      <AgendaTonesPicker
        ref="tonesPickerRef"
        :primary-color="markedDaysColor"
        :secondary-color="vacationColor"
        :primary-swatches="primarySwatches"
        :secondary-swatches="secondarySwatches"
        @update:primary="onPrimaryTone"
        @update:secondary="onSecondaryTone"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, nextTick } from "vue";
  import { storeToRefs } from "pinia";
  import { useThemePicker } from "@/composables/useThemePicker";
  import { CUSTOM_THEME_ID } from "@/data/themes";
  import { useThemeStore } from "@/stores/theme";
  import { useAgendaColorsStore } from "@/stores/agendaColors";
  import ConfigPageHeader from "@/components/config/ConfigPageHeader.vue";
  import ColorModePicker from "@/components/config/ColorModePicker.vue";
  import ThemePreviewSection from "@/components/config/ThemePreviewSection.vue";
  import ThemeDefaultsButton from "@/components/config/ThemeDefaultsButton.vue";
  import ThemeGrid from "@/components/config/ThemeGrid.vue";
  import type { ThemeGridOption } from "@/components/config/ThemeGrid.vue";
  import AgendaTonesPicker from "@/components/config/AgendaTonesPicker.vue";

  const picker = useThemePicker();
  const themeStore = useThemeStore();
  const agendaColorsStore = useAgendaColorsStore();
  const { themeId, colorMode } = storeToRefs(themeStore);
  const { markedDaysColor, vacationColor, agendaBg } = storeToRefs(agendaColorsStore);
  const tonesPickerRef = ref<InstanceType<typeof AgendaTonesPicker> | null>(null);

  const colorModeOptions = [
    { value: "light" as const, label: "Claro", icon: "☀️" },
    { value: "dark" as const, label: "Oscuro", icon: "🌙" },
    { value: "mixed" as const, label: "Mitad", icon: "◐" },
    { value: "system" as const, label: "Seguir sistema", icon: "💻" },
  ];

  const primarySwatches = [
    "#017074",
    "#7c3aed",
    "#4f46e5",
    "#059669",
    "#0ea5e9",
    "#db2777",
  ];

  const secondarySwatches = [
    "#db7f50",
    "#ea580c",
    "#e11d48",
    "#7c3aed",
    "#059669",
    "#b45309",
  ];

  const primaryColor = computed(() => markedDaysColor.value);
  const previewKey = ref(0);

  const handleValoresPorDefecto = () => {
    themeStore.resetToAppDefaults();
    agendaColorsStore.resetToThemeDefaults();
    previewKey.value += 1;
  };

  const onSelectTheme = (id: string) => {
    picker.setTheme(id);
    nextTick(() => {
      agendaColorsStore.resetToThemeDefaults();
    });
  };

  watch(themeId, (id) => {
    if (id === CUSTOM_THEME_ID) {
      nextTick(() => {
        tonesPickerRef.value?.sectionRef?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });

  const onPrimaryTone = (value: string) => {
    agendaColorsStore.updateColors({ markedDaysColor: value });
    if (themeId.value === CUSTOM_THEME_ID) {
      picker.setCustomColors({ primary: value, accent: value });
    }
  };

  const onSecondaryTone = (value: string) => {
    agendaColorsStore.updateColors({ vacationColor: value });
    if (themeId.value === CUSTOM_THEME_ID) {
      picker.setCustomColors({ accent: value });
    }
  };
</script>

<style scoped>
  .config-temas-page {
    --color-app-bg: #f4f4f5;
    --color-app-surface: #ffffff;
    --color-app-title: #18181b;
    --color-app-text: #71717a;
    --color-app-border: #e4e4e7;
    --color-app-border-subtle: #f4f4f5;
    --color-brand-accent: #0d9488;
    --color-brand-primary: #0d9488;
    background: var(--color-app-bg);
  }
</style>

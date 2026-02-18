import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/stores/theme";
import { THEME_OPTIONS, CUSTOM_THEME_ID, type ThemeColors } from "@/data/themes";

export const useThemePicker = () => {
  const themeStore = useThemeStore();
  const { themeId, customColors, titleTextOverrides } = storeToRefs(themeStore);

  const isSelected = (id: string) => themeId.value === id;
  const isCustomTheme = () => themeId.value === CUSTOM_THEME_ID;

  const displayTitleColor = computed(
    () =>
      titleTextOverrides.value?.title ??
      (themeId.value === CUSTOM_THEME_ID ? customColors.value?.title ?? "#111827" : "#111827")
  );
  const displayTextColor = computed(
    () =>
      titleTextOverrides.value?.text ??
      (themeId.value === CUSTOM_THEME_ID ? customColors.value?.text ?? "#334155" : "#334155")
  );

  return {
    options: THEME_OPTIONS,
    isSelected,
    setTheme: themeStore.setTheme,
    isCustomTheme,
    customColors,
    setCustomColor: themeStore.setCustomColor,
    setCustomColors: themeStore.setCustomColors,
    titleTextOverrides,
    displayTitleColor,
    displayTextColor,
    setTitleTextOverride: themeStore.setTitleTextOverride,
    applySystemColors: themeStore.applySystemColors,
    resetToThemeDefaults: themeStore.resetToThemeDefaults,
    resetToAppDefaults: themeStore.resetToAppDefaults,
  };
};

export type { ThemeColors };

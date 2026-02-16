import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { themeStorage } from "@/infrastructure/themeStorage";
import {
  DEFAULT_THEME_ID,
  DEFAULT_CUSTOM_THEME_COLORS,
  CUSTOM_THEME_ID,
  SYSTEM_PALETTE,
  type ThemeColors,
} from "@/data/themes";

const CUSTOM_VAR_MAP: Record<keyof ThemeColors, string> = {
  primary: "--color-spa-primary",
  accent: "--color-spa-teal",
  bg: "--color-app-bg",
  surface: "--color-app-surface",
  title: "--color-app-title",
  text: "--color-app-text",
};

const applyCustomColorsToDocument = (colors: ThemeColors) => {
  const root = document.documentElement;
  root.removeAttribute("data-theme");
  (Object.keys(CUSTOM_VAR_MAP) as (keyof ThemeColors)[]).forEach((key) => {
    root.style.setProperty(CUSTOM_VAR_MAP[key], colors[key]);
  });
  root.style.setProperty("--color-spa-white", colors.surface);
};

const applyPresetThemeToDocument = (themeId: string) => {
  (Object.values(CUSTOM_VAR_MAP) as string[]).forEach((varName) => {
    document.documentElement.style.removeProperty(varName);
  });
  document.documentElement.setAttribute("data-theme", themeId);
};

const applyTitleTextOverrides = (overrides: { title: string; text: string } | null) => {
  const root = document.documentElement;
  if (overrides) {
    root.style.setProperty("--color-app-title", overrides.title);
    root.style.setProperty("--color-app-text", overrides.text);
  } else {
    root.style.removeProperty("--color-app-title");
    root.style.removeProperty("--color-app-text");
  }
};

const applyThemeToDocument = (themeId: string, customColors: ThemeColors) => {
  if (themeId === CUSTOM_THEME_ID) {
    applyCustomColorsToDocument(customColors);
  } else {
    applyPresetThemeToDocument(themeId);
  }
};

export const useThemeStore = defineStore("theme", () => {
  const themeId = ref(themeStorage.get() ?? DEFAULT_THEME_ID);
  const customColors = ref<ThemeColors>(
    themeStorage.getCustomColors() ?? DEFAULT_CUSTOM_THEME_COLORS
  );
  const titleTextOverrides = ref<{ title: string; text: string } | null>(
    themeStorage.getTitleTextOverrides()
  );

  const setTheme = (id: string) => {
    themeId.value = id;
    themeStorage.set(id);
    applyThemeToDocument(id, customColors.value);
    applyTitleTextOverrides(titleTextOverrides.value);
  };

  const setTitleTextOverride = (which: "title" | "text", value: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return;
    const prev = titleTextOverrides.value;
    const next = {
      title: which === "title" ? value : (prev?.title ?? customColors.value.title),
      text: which === "text" ? value : (prev?.text ?? customColors.value.text),
    };
    titleTextOverrides.value = next;
    themeStorage.setTitleTextOverrides(next);
    applyTitleTextOverrides(next);
  };

  const setCustomColor = <K extends keyof ThemeColors>(key: K, value: string) => {
    customColors.value = { ...customColors.value, [key]: value };
    themeStorage.setCustomColors(customColors.value);
    if (themeId.value === CUSTOM_THEME_ID) {
      applyCustomColorsToDocument(customColors.value);
    }
  };

  const setCustomColors = (colors: Partial<ThemeColors>) => {
    customColors.value = { ...customColors.value, ...colors };
    themeStorage.setCustomColors(customColors.value);
    if (themeId.value === CUSTOM_THEME_ID) {
      applyCustomColorsToDocument(customColors.value);
    }
  };

  const applySystemColors = () => {
    const overrides = { title: SYSTEM_PALETTE.title, text: SYSTEM_PALETTE.text };
    titleTextOverrides.value = overrides;
    themeStorage.setTitleTextOverrides(overrides);
    if (themeId.value === CUSTOM_THEME_ID) {
      customColors.value = {
        ...customColors.value,
        primary: SYSTEM_PALETTE.primary,
        accent: SYSTEM_PALETTE.primary,
      };
      themeStorage.setCustomColors(customColors.value);
      applyCustomColorsToDocument(customColors.value);
    }
    applyTitleTextOverrides(overrides);
  };

  applyThemeToDocument(themeId.value, customColors.value);
  applyTitleTextOverrides(titleTextOverrides.value);

  watch(themeId, (id) => {
    applyThemeToDocument(id, customColors.value);
    applyTitleTextOverrides(titleTextOverrides.value);
  });

  watch(customColors, (colors) => {
    if (themeId.value === CUSTOM_THEME_ID) {
      applyCustomColorsToDocument(colors);
    }
  }, { deep: true });

  return {
    themeId,
    customColors,
    titleTextOverrides,
    setTheme,
    setCustomColor,
    setCustomColors,
    setTitleTextOverride,
    applySystemColors,
  };
});

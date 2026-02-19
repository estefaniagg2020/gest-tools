import { defineStore } from "pinia";
import { computed } from "vue";
import { type ColorMode } from "@/infrastructure/themeStorage";
import { useGestorConfigStore } from "./gestorConfig";
import { useAuthStore } from "./auth";
import {
  DEFAULT_THEME_ID,
  DEFAULT_CUSTOM_THEME_COLORS,
  CUSTOM_THEME_ID,
  SYSTEM_PALETTE,
  type ThemeColors,
} from "@/data/themes";

const CUSTOM_VAR_MAP: Record<keyof ThemeColors, string> = {
  primary: "--color-brand-primary",
  accent: "--color-brand-accent",
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
  root.style.setProperty("--color-brand-white", colors.surface);
  root.style.setProperty("--color-app-surface", colors.surface);
};

const applyPresetThemeToDocument = (themeId: string) => {
  const root = document.documentElement;
  (Object.keys(CUSTOM_VAR_MAP) as (keyof ThemeColors)[]).forEach((key) => {
    root.style.removeProperty(CUSTOM_VAR_MAP[key]);
  });
  root.setAttribute("data-theme", themeId);
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

const resolveDark = (mode: ColorMode): boolean => {
  if (mode === "dark") return true;
  if (mode === "light" || mode === "mixed") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const applyColorModeToDocument = (mode: ColorMode) => {
  const root = document.documentElement;
  const dark = resolveDark(mode);
  root.classList.toggle("dark", dark);
  root.classList.toggle("color-mode-mixed", mode === "mixed");
};

export const useThemeStore = defineStore("theme", () => {
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();

  const themeId = computed(() => (configStore.themeId as string) || DEFAULT_THEME_ID);
  const colorMode = computed(() => (configStore.colorMode as ColorMode) || "system");
  const customColors = computed(() => (configStore.customColors as ThemeColors) || DEFAULT_CUSTOM_THEME_COLORS);
  const titleTextOverrides = computed(() => (configStore.titleTextOverrides as { title: string; text: string } | null) || null);

  const persist = async (updates: any) => {
    const currentFullConfig = configStore.getConfig();
    await configStore.setConfig(
      (authStore.user as any)?.id || authStore.currentUserId || "default",
      { ...currentFullConfig, ...updates },
      (authStore.user as any)?.businessId
    );
  };

  const setTheme = async (id: string) => {
    await persist({ themeId: id });
    applyThemeToDocument(id, customColors.value);
    applyTitleTextOverrides(titleTextOverrides.value);
  };

  const setTitleTextOverride = async (which: "title" | "text", value: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return;
    const prev = titleTextOverrides.value;
    const next = {
      title: which === "title" ? value : (prev?.title ?? customColors.value.title),
      text: which === "text" ? value : (prev?.text ?? customColors.value.text),
    };
    await persist({ titleTextOverrides: next });
    applyTitleTextOverrides(next);
  };

  const setCustomColor = async <K extends keyof ThemeColors>(key: K, value: string) => {
    const nextColors = { ...customColors.value, [key]: value };
    await persist({ customColors: nextColors });
    if (themeId.value === CUSTOM_THEME_ID) {
      applyCustomColorsToDocument(nextColors);
    }
  };

  const setCustomColors = async (colors: Partial<ThemeColors>) => {
    const nextColors = { ...customColors.value, ...colors };
    await persist({ customColors: nextColors });
    if (themeId.value === CUSTOM_THEME_ID) {
      applyCustomColorsToDocument(nextColors);
    }
  };

  const applySystemColors = async () => {
    const overrides = { title: SYSTEM_PALETTE.title, text: SYSTEM_PALETTE.text };
    const updates: any = { titleTextOverrides: overrides };
    if (themeId.value === CUSTOM_THEME_ID) {
      updates.customColors = {
        ...customColors.value,
        primary: SYSTEM_PALETTE.primary,
        accent: SYSTEM_PALETTE.primary,
      };
    }
    await persist(updates);
    applyTitleTextOverrides(overrides);
  };

  const resetToThemeDefaults = async () => {
    const updates: any = { titleTextOverrides: null };
    if (themeId.value === CUSTOM_THEME_ID) {
      updates.customColors = { ...DEFAULT_CUSTOM_THEME_COLORS };
    }
    await persist(updates);
    applyThemeToDocument(themeId.value, updates.customColors || customColors.value);
    applyTitleTextOverrides(null);
  };

  const resetToAppDefaults = async () => {
    const updates = {
      themeId: DEFAULT_THEME_ID,
      titleTextOverrides: null,
      customColors: { ...DEFAULT_CUSTOM_THEME_COLORS },
      colorMode: "system" as ColorMode
    };
    await persist(updates);
    applyThemeToDocument(DEFAULT_THEME_ID, updates.customColors);
    applyTitleTextOverrides(null);
    applyColorModeToDocument("system");
  };

  const setColorMode = async (mode: ColorMode) => {
    await persist({ colorMode: mode });
    applyColorModeToDocument(mode);
  };

  // Side effects (apply initially)
  // We can't easily wait for initialize here, so we rely on the computes being reactive
  // and AppLayout calling initialize.
  // Actually, we should call these in a watch or onMounted if we want to be safe.
  
  // Note: Initial application happens in AppLayout or similar through these computes
  // but to ensure document stays in sync:
  /*
  watch([themeId, customColors], ([id, colors]) => {
    applyThemeToDocument(id, colors);
  }, { immediate: true });
  */

  return {
    themeId,
    colorMode,
    customColors,
    titleTextOverrides,
    setTheme,
    setColorMode,
    setCustomColor,
    setCustomColors,
    setTitleTextOverride,
    applySystemColors,
    resetToThemeDefaults,
    resetToAppDefaults,
  };
});

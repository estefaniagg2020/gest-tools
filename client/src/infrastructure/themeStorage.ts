import type { ThemeColors } from "@/data/themes";

const THEME_KEY = "gestor-theme";
const CUSTOM_COLORS_KEY = "gestor-theme-custom";
const TITLE_TEXT_OVERRIDES_KEY = "gestor-theme-title-text";
const COLOR_MODE_KEY = "gestor-color-mode";

export type ColorMode = "light" | "dark" | "mixed" | "system";

const isHexColor = (v: unknown): v is string =>
  typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v);

export const themeStorage = {
  get(): string | null {
    try {
      const raw = localStorage.getItem(THEME_KEY);
      return typeof raw === "string" && raw.length > 0 ? raw : null;
    } catch {
      return null;
    }
  },

  set(themeId: string): void {
    try {
      localStorage.setItem(THEME_KEY, themeId);
    } catch {
      /* ignore */
    }
  },

  getCustomColors(): ThemeColors | null {
    try {
      const raw = localStorage.getItem(CUSTOM_COLORS_KEY);
      if (typeof raw !== "string") return null;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (
        isHexColor(parsed.primary) &&
        isHexColor(parsed.accent) &&
        isHexColor(parsed.bg) &&
        isHexColor(parsed.surface) &&
        isHexColor(parsed.text)
      ) {
        const title = isHexColor(parsed.title) ? parsed.title : (parsed.text as string);
        return {
          primary: parsed.primary as string,
          accent: parsed.accent as string,
          bg: parsed.bg as string,
          surface: parsed.surface as string,
          title,
          text: parsed.text as string,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  setCustomColors(colors: ThemeColors): void {
    try {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
    } catch {
      /* ignore */
    }
  },

  getTitleTextOverrides(): { title: string; text: string } | null {
    try {
      const raw = localStorage.getItem(TITLE_TEXT_OVERRIDES_KEY);
      if (typeof raw !== "string") return null;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (isHexColor(parsed.title) && isHexColor(parsed.text)) {
        return { title: parsed.title as string, text: parsed.text as string };
      }
      return null;
    } catch {
      return null;
    }
  },

  setTitleTextOverrides(colors: { title: string; text: string }): void {
    try {
      localStorage.setItem(TITLE_TEXT_OVERRIDES_KEY, JSON.stringify(colors));
    } catch {
      /* ignore */
    }
  },

  clearTitleTextOverrides(): void {
    try {
      localStorage.removeItem(TITLE_TEXT_OVERRIDES_KEY);
    } catch {
      /* ignore */
    }
  },

  getColorMode(): ColorMode | null {
    try {
      const raw = localStorage.getItem(COLOR_MODE_KEY);
      if (raw === "light" || raw === "dark" || raw === "mixed" || raw === "system") return raw;
      return null;
    } catch {
      return null;
    }
  },

  setColorMode(mode: ColorMode): void {
    try {
      localStorage.setItem(COLOR_MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  },
};

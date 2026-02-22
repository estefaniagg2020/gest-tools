import type { ThemeColors } from "@/data/themes";

export type ColorMode = "light" | "dark" | "mixed" | "system";

export const themeStorage = {
  get(): string | null {
    return null;
  },

  set(_themeId: string): void {
    return;
  },

  getCustomColors(): ThemeColors | null {
    return null;
  },

  setCustomColors(_colors: ThemeColors): void {
    return;
  },

  getTitleTextOverrides(): { title: string; text: string } | null {
    return null;
  },

  setTitleTextOverrides(_colors: { title: string; text: string }): void {
    return;
  },

  clearTitleTextOverrides(): void {
    return;
  },

  getColorMode(): ColorMode | null {
    return null;
  },

  setColorMode(_mode: ColorMode): void {
    return;
  },
};

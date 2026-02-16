export type SidebarPosition = "left" | "right" | "none";

export type CalendarAppearance = "default" | "compact" | "spacious";

export interface LayoutConfig {
  sidebarPosition: SidebarPosition;
  showNavbar: boolean;
  calendarAppearance: CalendarAppearance;
  sidebarModuleIds: string[];
}

export const DEFAULT_SIDEBAR_MODULE_IDS: string[] = [
  "inicio",
  "agenda",
  "equipo",
  "clientes",
  "servicios",
  "config",
];

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  sidebarPosition: "left",
  showNavbar: false,
  calendarAppearance: "default",
  sidebarModuleIds: [...DEFAULT_SIDEBAR_MODULE_IDS],
};

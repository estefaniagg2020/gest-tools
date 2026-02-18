export type SidebarPosition = "left" | "right" | "none";

export type CalendarAppearance = "default" | "compact" | "spacious";

export interface LayoutConfig {
  sidebarPosition: SidebarPosition;
  showNavbar: boolean;
  calendarAppearance: CalendarAppearance;
  sidebarModuleIds: string[];
  dashboardModuleIds: string[];
}

export const DEFAULT_SIDEBAR_MODULE_IDS: string[] = [
  "inicio",
  "agenda",
  "equipo",
  "clientes",
  "servicios",
  "inventario",
  "config",
];

export const DEFAULT_DASHBOARD_MODULE_IDS: string[] = [
  "reservas-mes",
  "reservas-semana",
  "beneficio-diario",
  "ingresos-mes",
  "reservas-canceladas",
  "tasa-cancelacion",
  "grafica-reservas-persona",
  "empleado-mas-reservas",
  "ventas-por-empleado",
  "servicios-populares",
  "clientes-nuevos",
  "proximas-citas-hoy",
  "ocupacion-semanal",
  "horas-trabajadas",
  "productos-bajo-stock",
];

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  sidebarPosition: "left",
  showNavbar: false,
  calendarAppearance: "default",
  sidebarModuleIds: [...DEFAULT_SIDEBAR_MODULE_IDS],
  dashboardModuleIds: [...DEFAULT_DASHBOARD_MODULE_IDS],
};

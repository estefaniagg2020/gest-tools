export type DashboardWidgetSize = "small" | "medium" | "large";

export interface DashboardWidgetModule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  size?: DashboardWidgetSize;
}

export const DASHBOARD_WIDGET_MODULES: readonly DashboardWidgetModule[] = [
  { id: "reservas-mes", title: "Reservas del mes", description: "Total de reservas confirmadas durante el mes en curso.", icon: "📅", size: "small" },
  { id: "reservas-semana", title: "Reservas de la semana", description: "Reservas confirmadas en la semana actual.", icon: "📆", size: "small" },
  { id: "beneficio-diario", title: "Beneficio diario", description: "Ingresos generados por las reservas de hoy.", icon: "💰", size: "small" },
  { id: "ingresos-mes", title: "Ingresos del mes", description: "Total acumulado de ingresos en el mes en curso.", icon: "💵", size: "small" },
  { id: "reservas-canceladas", title: "Reservas canceladas", description: "Número de reservas canceladas este mes.", icon: "❌", size: "small" },
  { id: "tasa-cancelacion", title: "Tasa de cancelación", description: "Porcentaje de reservas canceladas sobre el total del mes.", icon: "📉", size: "small" },
  { id: "clientes-nuevos", title: "Clientes nuevos", description: "Clientes que reservaron por primera vez este mes.", icon: "🆕", size: "small" },
  { id: "ocupacion-semanal", title: "Ocupación semanal", description: "Porcentaje de franjas ocupadas vs disponibles esta semana.", icon: "📊", size: "small" },
  { id: "horas-trabajadas", title: "Horas trabajadas", description: "Total de horas con cita del equipo esta semana.", icon: "⏱️", size: "small" },
  { id: "empleado-mas-reservas", title: "Empleado con más reservas", description: "El miembro del equipo con más reservas este mes.", icon: "🏆", size: "medium" },
  { id: "grafica-reservas-persona", title: "Reservas por persona", description: "Reparto de reservas entre los miembros del equipo.", icon: "👥", size: "large" },
  { id: "ventas-por-empleado", title: "Ventas por empleado", description: "Ranking de ingresos generados por cada miembro del equipo.", icon: "💼", size: "large" },
  { id: "servicios-populares", title: "Servicios más solicitados", description: "Ranking de los servicios más reservados este mes.", icon: "⭐", size: "large" },
  { id: "proximas-citas-hoy", title: "Próximas citas de hoy", description: "Las citas más próximas del día en curso.", icon: "🕐", size: "medium" },
  { id: "productos-bajo-stock", title: "Productos bajo stock", description: "Productos del inventario que están a punto de acabarse.", icon: "📦", size: "medium" },
];

export const DASHBOARD_WIDGET_IDS = DASHBOARD_WIDGET_MODULES.map((m) => m.id);

export const getDashboardWidgetById = (id: string): DashboardWidgetModule | undefined =>
  DASHBOARD_WIDGET_MODULES.find((m) => m.id === id);

const WIDGET_COL_SPAN: Record<DashboardWidgetSize, string> = {
  small: "sm:col-span-1",
  medium: "sm:col-span-2",
  large: "sm:col-span-3",
};

export const getWidgetColSpan = (size: DashboardWidgetSize = "small"): string =>
  WIDGET_COL_SPAN[size];

export const orderDashboardWidgetsByIds = (ids: string[]): DashboardWidgetModule[] => {
  const byId = new Map(DASHBOARD_WIDGET_MODULES.map((m) => [m.id, m]));
  const ordered: DashboardWidgetModule[] = [];
  for (const id of ids) {
    const mod = byId.get(id);
    if (mod) ordered.push(mod);
  }
  return ordered;
};

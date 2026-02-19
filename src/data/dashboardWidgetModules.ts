export type DashboardWidgetSize = "small" | "medium" | "large";

export interface DashboardWidgetModule {
  id: string;
  titleKey: string;
  descKey: string;
  icon?: string;
  size?: DashboardWidgetSize;
}

export const DASHBOARD_WIDGET_MODULES: readonly DashboardWidgetModule[] = [
  { id: "reservas-mes", titleKey: "dashboardWidgets.reservasMes", descKey: "dashboardWidgets.reservasMesDesc", icon: "📅", size: "small" },
  { id: "reservas-semana", titleKey: "dashboardWidgets.reservasSemana", descKey: "dashboardWidgets.reservasSemanaDesc", icon: "📆", size: "small" },
  { id: "beneficio-diario", titleKey: "dashboardWidgets.beneficioDiario", descKey: "dashboardWidgets.beneficioDiarioDesc", icon: "💰", size: "small" },
  { id: "ingresos-mes", titleKey: "dashboardWidgets.ingresosMes", descKey: "dashboardWidgets.ingresosMesDesc", icon: "💵", size: "small" },
  { id: "reservas-canceladas", titleKey: "dashboardWidgets.reservasCanceladas", descKey: "dashboardWidgets.reservasCanceladasDesc", icon: "❌", size: "small" },
  { id: "tasa-cancelacion", titleKey: "dashboardWidgets.tasaCancelacion", descKey: "dashboardWidgets.tasaCancelacionDesc", icon: "📉", size: "small" },
  { id: "clientes-nuevos", titleKey: "dashboardWidgets.clientesNuevos", descKey: "dashboardWidgets.clientesNuevosDesc", icon: "🆕", size: "small" },
  { id: "ocupacion-semanal", titleKey: "dashboardWidgets.ocupacionSemanal", descKey: "dashboardWidgets.ocupacionSemanalDesc", icon: "📊", size: "small" },
  { id: "horas-trabajadas", titleKey: "dashboardWidgets.horasTrabajadas", descKey: "dashboardWidgets.horasTrabajadasDesc", icon: "⏱️", size: "small" },
  { id: "empleado-mas-reservas", titleKey: "dashboardWidgets.empleadoMasReservas", descKey: "dashboardWidgets.empleadoMasReservasDesc", icon: "🏆", size: "medium" },
  { id: "grafica-reservas-persona", titleKey: "dashboardWidgets.graficaReservasPersona", descKey: "dashboardWidgets.graficaReservasPersonaDesc", icon: "👥", size: "large" },
  { id: "ventas-por-empleado", titleKey: "dashboardWidgets.ventasPorEmpleado", descKey: "dashboardWidgets.ventasPorEmpleadoDesc", icon: "💼", size: "large" },
  { id: "servicios-populares", titleKey: "dashboardWidgets.serviciosPopulares", descKey: "dashboardWidgets.serviciosPopularesDesc", icon: "⭐", size: "large" },
  { id: "proximas-citas-hoy", titleKey: "dashboardWidgets.proximasCitasHoy", descKey: "dashboardWidgets.proximasCitasHoyDesc", icon: "🕐", size: "medium" },
  { id: "productos-bajo-stock", titleKey: "dashboardWidgets.productosBajoStock", descKey: "dashboardWidgets.productosBajoStockDesc", icon: "📦", size: "medium" },
  { id: "lista-espera", titleKey: "dashboardWidgets.listaEspera", descKey: "dashboardWidgets.listaEsperaDesc", icon: "⏳", size: "medium" },
];

export const DASHBOARD_WIDGET_IDS = DASHBOARD_WIDGET_MODULES.map((m) => m.id);

export const getDashboardWidgetById = (id: string): DashboardWidgetModule | undefined =>
  DASHBOARD_WIDGET_MODULES.find((m) => m.id === id);

const WIDGET_COL_SPAN: Record<DashboardWidgetSize, string> = {
  small: "col-span-1",
  medium: "col-span-1 sm:col-span-2",
  large: "col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4",
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

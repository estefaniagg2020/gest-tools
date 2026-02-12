/**
 * Configuración del dashboard: datos iniciales del gráfico de ingresos
 * y de la línea de actividad reciente.
 */

export interface ChartDataItem {
  label: string;
  value: number;
  percent: number;
}

export interface RecentActivityItem {
  title: string;
  time: string;
  dotClass: string;
}

/** Datos iniciales del gráfico de ingresos por día de la semana */
export const DASHBOARD_CHART_DATA: ChartDataItem[] = [
  { label: "Lun", value: 850, percent: 40 },
  { label: "Mar", value: 1200, percent: 65 },
  { label: "Mié", value: 950, percent: 50 },
  { label: "Jue", value: 1500, percent: 80 },
  { label: "Vie", value: 1800, percent: 95 },
  { label: "Sáb", value: 2100, percent: 100 },
  { label: "Dom", value: 600, percent: 30 },
];

/** Actividad reciente mostrada en el dashboard (datos de ejemplo) */
export const DASHBOARD_RECENT_ACTIVITY: RecentActivityItem[] = [
  { title: "Nueva cita: Masaje Relajante", time: "Hace 10 min", dotClass: "bg-green-500" },
  { title: "Antonio actualizó su horario", time: "Hace 45 min", dotClass: "bg-blue-500" },
  { title: "Cancelación: Sala 3", time: "Hace 2 horas", dotClass: "bg-red-400" },
  { title: "Nuevo cliente registrado", time: "Hace 3 horas", dotClass: "bg-orange-400" },
  { title: "Cierre de caja diario", time: "Ayer, 21:00", dotClass: "bg-gray-400" },
];

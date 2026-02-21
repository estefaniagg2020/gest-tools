export interface ReservasPorPersonaItem {
  employeeId: string | null;
  employeeName: string | null;
  count: number;
}

export interface ServicioPopularItem {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface ProximaCitaItem {
  id: string;
  serviceName: string;
  employeeName: string | null;
  start: string;
}

export interface ListaEsperaItem {
  id: string;
  clientName: string;
  serviceName: string;
  preferredStart: string;
  createdAt: string;
}

export interface ProductoBajoStockItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface EmpleadoMasReservasItem {
  employeeId: string | null;
  employeeName: string | null;
  count: number;
}

export interface VentasPorEmpleadoItem {
  employeeId: string | null;
  employeeName: string | null;
  amount: number;
}

export interface DashboardStats {
  reservasMes: number;
  reservasSemana: number;
  beneficioHoy: number;
  ingresosMes: number;
  reservasCanceladas: number;
  tasaCancelacion: number;
  reservasPorPersona: ReservasPorPersonaItem[];
  empleadoMasReservas: EmpleadoMasReservasItem | null;
  ventasPorEmpleado: VentasPorEmpleadoItem[];
  serviciosPopulares: ServicioPopularItem[];
  clientesNuevos: number;
  proximasCitasHoy: ProximaCitaItem[];
  ocupacionSemanal: number;
  horasTrabajadasSemana: number;
  productosBajoStock: ProductoBajoStockItem[];
  listaEspera: ListaEsperaItem[];
}

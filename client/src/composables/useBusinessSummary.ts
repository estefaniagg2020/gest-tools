import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { dashboardApi } from "@/infrastructure/dashboardApi";
import { downloadFile } from "@/infrastructure/exportFile";
import type { DashboardStats } from "@/interfaces/dashboardStats";
import { useAppointmentStore } from "@/stores/appointment";
import { useClientStore } from "@/stores/client";
import { useServiceStore } from "@/stores/service";
import { useTeamStore } from "@/stores/team";

export type SummaryPeriod = "daily" | "weekly" | "monthly";

// UTF-8 BOM so Excel opens CSV files with correct encoding
const BOM = "\uFEFF";

const formatDateStamp = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const escapeCsvCell = (value: string | number | null | undefined): string => {
  const text = value == null ? "" : String(value);
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.split('"').join('""')}"`;
  }
  return text;
};

const csvRow = (cells: (string | number | null | undefined)[]): string =>
  cells.map(escapeCsvCell).join(",");

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getPeriodBounds = (period: SummaryPeriod, now: Date): { start: Date; end: Date } => {
  const base = new Date(now);
  if (period === "daily") {
    return { start: startOfDay(base), end: endOfDay(base) };
  }
  if (period === "weekly") {
    const day = base.getDay();
    const offsetToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(base);
    start.setDate(base.getDate() + offsetToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: startOfDay(start), end: endOfDay(end) };
  }
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { start: startOfDay(start), end: endOfDay(end) };
};

export const useBusinessSummary = () => {
  const { t } = useI18n();
  const isOpen = ref(false);
  const period = ref<SummaryPeriod>("daily");
  const loading = ref(false);
  const error = ref<string | null>(null);
  const stats = ref<DashboardStats | null>(null);

  const teamStore = useTeamStore();
  const clientStore = useClientStore();
  const serviceStore = useServiceStore();
  const appointmentStore = useAppointmentStore();

  const servicePriceById = computed(() =>
    new Map(serviceStore.services.map((service) => [service.id, service.price])),
  );

  const serviceNameById = computed(() =>
    new Map(serviceStore.services.map((service) => [service.id, service.name])),
  );

  const periodBounds = computed(() => getPeriodBounds(period.value, new Date()));

  const appointmentsInPeriod = computed(() =>
    appointmentStore.appointments.filter((appointment) => {
      if (appointment.status === "cancelled") return false;
      const start = new Date(appointment.start);
      if (Number.isNaN(start.getTime())) return false;
      return start >= periodBounds.value.start && start <= periodBounds.value.end;
    }),
  );

  const salesInPeriod = computed(() =>
    appointmentsInPeriod.value.reduce((sum, appointment) => {
      const cartTotal = (appointment.cartItems ?? []).reduce(
        (acc, item) => acc + item.quantity * item.unitPrice,
        0,
      );
      if (cartTotal > 0) return sum + cartTotal;
      if (appointment.serviceId) {
        return sum + (servicePriceById.value.get(appointment.serviceId) ?? 0);
      }
      return sum;
    }, 0),
  );

  const topServicesInPeriod = computed(() => {
    const counter = new Map<string, { serviceName: string; count: number }>();
    appointmentsInPeriod.value.forEach((appointment) => {
      const key = appointment.serviceId ?? "__no_service";
      const serviceName = appointment.serviceId
        ? (serviceNameById.value.get(appointment.serviceId) ?? t("configReports.serviceGeneric"))
        : t("configReports.noService");
      const prev = counter.get(key);
      if (prev) {
        counter.set(key, { ...prev, count: prev.count + 1 });
      } else {
        counter.set(key, { serviceName, count: 1 });
      }
    });
    return Array.from(counter.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  const totalClients = computed(() => clientStore.clients.length);
  const totalUsers = computed(() => teamStore.members.length);
  const totalAppointments = computed(() => appointmentStore.appointments.length);

  const periodSalesLabel = computed(() => {
    if (period.value === "daily") return t("configReports.salesToday");
    if (period.value === "weekly") return t("configReports.salesWeek");
    return t("configReports.salesMonth");
  });

  const periodAppointmentsLabel = computed(() => {
    if (period.value === "daily") return t("configReports.appointmentsToday");
    if (period.value === "weekly") return t("configReports.appointmentsWeek");
    return t("configReports.appointmentsMonth");
  });

  const dashboardHighlights = computed(() => {
    const fallback = {
      reservasSemana: 0,
      reservasMes: 0,
      beneficioHoy: 0,
      ingresosMes: 0,
    };
    return {
      reservasSemana: stats.value?.reservasSemana ?? fallback.reservasSemana,
      reservasMes: stats.value?.reservasMes ?? fallback.reservasMes,
      beneficioHoy: stats.value?.beneficioHoy ?? fallback.beneficioHoy,
      ingresosMes: stats.value?.ingresosMes ?? fallback.ingresosMes,
    };
  });

  /** Load all stores (resilient — none throw) + try dashboard stats (optional). */
  const loadStores = async (): Promise<void> => {
    await Promise.all([
      teamStore.initialize(),
      clientStore.initialize(),
      serviceStore.initialize(),
      appointmentStore.initialize(),
    ]);
    try {
      stats.value = await dashboardApi.getStats();
    } catch {
      // Stats are optional — local store data is used as fallback
    }
  };

  const load = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await loadStores();
    } catch (e) {
      error.value = e instanceof Error ? e.message : t("configReports.loadError");
    } finally {
      loading.value = false;
    }
  };

  const open = async (): Promise<void> => {
    isOpen.value = true;
    await load();
  };

  const close = (): void => {
    isOpen.value = false;
  };

  const setPeriod = (next: SummaryPeriod): void => {
    period.value = next;
  };

  // ── Per-report CSV exports ───────────────────────────────────────────────

  const exportClientsReport = (): void => {
    const headers = ["ID", "Nombre", "Email", "Teléfono", "Notas"];
    const rows = clientStore.clients.map((c) => [
      c.id,
      c.name,
      c.email ?? "",
      c.phone ?? "",
      c.notes ?? "",
    ]);
    const content =
      BOM + [headers.map(escapeCsvCell).join(","), ...rows.map(csvRow)].join("\n");
    downloadFile({
      fileName: `clientes-${formatDateStamp(new Date())}.csv`,
      content,
      mimeType: "text/csv;charset=utf-8",
    });
  };

  const exportSalesReport = (): void => {
    const headers = [
      "ID",
      "Fecha",
      "Hora",
      "Cliente",
      "Servicio",
      "Estado",
      "Precio (€)",
      "Estado pago",
    ];
    const rows = appointmentStore.appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => {
        const start = new Date(a.start);
        return [
          a.id,
          start.toLocaleDateString("es-ES"),
          start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          a.clientName ?? "",
          serviceNameById.value.get(a.serviceId ?? "") ?? "",
          a.status ?? "",
          servicePriceById.value.get(a.serviceId ?? "") ?? 0,
          a.paymentStatus ?? "",
        ];
      });
    const content =
      BOM + [headers.map(escapeCsvCell).join(","), ...rows.map(csvRow)].join("\n");
    downloadFile({
      fileName: `ventas-${formatDateStamp(new Date())}.csv`,
      content,
      mimeType: "text/csv;charset=utf-8",
    });
  };

  const exportAppointmentsReport = (): void => {
    const label =
      period.value === "daily" ? "diario" : period.value === "weekly" ? "semanal" : "mensual";
    const headers = [
      "ID",
      "Fecha",
      "Hora inicio",
      "Hora fin",
      "Cliente",
      "Servicio",
      "Estado",
      "Precio (€)",
    ];
    const rows = appointmentsInPeriod.value.map((a) => {
      const start = new Date(a.start);
      const end = new Date(a.end);
      return [
        a.id,
        start.toLocaleDateString("es-ES"),
        start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        a.clientName ?? "",
        serviceNameById.value.get(a.serviceId ?? "") ?? "",
        a.status ?? "",
        servicePriceById.value.get(a.serviceId ?? "") ?? 0,
      ];
    });
    const content =
      BOM + [headers.map(escapeCsvCell).join(","), ...rows.map(csvRow)].join("\n");
    downloadFile({
      fileName: `informe-${label}-${formatDateStamp(new Date())}.csv`,
      content,
      mimeType: "text/csv;charset=utf-8",
    });
  };

  // ── Full exports (CSV + Excel) ───────────────────────────────────────────

  const exportCsv = (): void => {
    const section = (
      title: string,
      headers: string[],
      rows: (string | number | null | undefined)[][],
    ): string => {
      const head = headers.map((h) => escapeCsvCell(h)).join(",");
      const body = rows.map((row) => csvRow(row)).join("\n");
      return `${title}\n${head}\n${body}`;
    };

    const content =
      BOM +
      [
        section("RESUMEN", ["Campo", "Valor"], [
          [periodSalesLabel.value, salesInPeriod.value.toFixed(2)],
          [periodAppointmentsLabel.value, appointmentsInPeriod.value.length],
          ["Clientes totales", totalClients.value],
          ["Usuarios totales", totalUsers.value],
          ["Citas totales", totalAppointments.value],
          ["Reservas semana", dashboardHighlights.value.reservasSemana],
          ["Reservas mes", dashboardHighlights.value.reservasMes],
          ["Beneficio hoy (€)", dashboardHighlights.value.beneficioHoy.toFixed(2)],
          ["Ingresos mes (€)", dashboardHighlights.value.ingresosMes.toFixed(2)],
        ]),
        section(
          "SERVICIOS_FRECUENTES",
          ["Servicio", "Reservas"],
          topServicesInPeriod.value.map((row) => [row.serviceName, row.count]),
        ),
        section(
          "CLIENTES",
          ["ID", "Nombre", "Email", "Teléfono", "Notas"],
          clientStore.clients.map((c) => [c.id, c.name, c.email, c.phone, c.notes]),
        ),
        section(
          "EQUIPO",
          ["ID", "Nombre", "Email", "Teléfono", "Rol", "Horas semanales"],
          teamStore.members.map((m) => [m.id, m.name, m.email, m.phoneNumber, m.role, m.weeklyHours]),
        ),
        section(
          "SERVICIOS",
          ["ID", "Nombre", "Categoría", "Duración (min)", "Precio (€)"],
          serviceStore.services.map((s) => [s.id, s.name, s.category, s.duration, s.price]),
        ),
        section(
          "CITAS",
          ["ID", "Fecha", "Hora", "Cliente", "Servicio", "Estado", "Pago"],
          appointmentStore.appointments.map((a) => {
            const start = new Date(a.start);
            return [
              a.id,
              start.toLocaleDateString("es-ES"),
              start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
              a.clientName,
              serviceNameById.value.get(a.serviceId ?? "") ?? a.serviceId,
              a.status,
              a.paymentStatus,
            ];
          }),
        ),
      ].join("\n\n");

    downloadFile({
      fileName: `resumen-negocio-${formatDateStamp(new Date())}.csv`,
      content,
      mimeType: "text/csv;charset=utf-8",
    });
  };

  const exportExcel = (): void => {
    const makeRows = (rows: (string | number | null | undefined)[][]): string =>
      rows
        .map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "")}</td>`).join("")}</tr>`)
        .join("");

    const table = (
      title: string,
      headers: string[],
      rows: (string | number | null | undefined)[][],
    ): string =>
      `<h3>${title}</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${makeRows(rows)}</tbody></table><br/>`;

    const content = `
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    ${table("Resumen", ["Campo", "Valor"], [
      [periodSalesLabel.value, salesInPeriod.value.toFixed(2)],
      [periodAppointmentsLabel.value, appointmentsInPeriod.value.length],
      ["Clientes totales", totalClients.value],
      ["Usuarios totales", totalUsers.value],
      ["Citas totales", totalAppointments.value],
      ["Reservas semana", dashboardHighlights.value.reservasSemana],
      ["Reservas mes", dashboardHighlights.value.reservasMes],
      ["Beneficio hoy (€)", dashboardHighlights.value.beneficioHoy.toFixed(2)],
      ["Ingresos mes (€)", dashboardHighlights.value.ingresosMes.toFixed(2)],
    ])}
    ${table("Servicios frecuentes", ["Servicio", "Reservas"], topServicesInPeriod.value.map((row) => [row.serviceName, row.count]))}
    ${table("Clientes", ["ID", "Nombre", "Email", "Teléfono", "Notas"], clientStore.clients.map((c) => [c.id, c.name, c.email, c.phone, c.notes]))}
    ${table("Equipo", ["ID", "Nombre", "Email", "Teléfono", "Rol", "Horas semanales"], teamStore.members.map((m) => [m.id, m.name, m.email, m.phoneNumber, m.role, m.weeklyHours]))}
    ${table("Servicios", ["ID", "Nombre", "Categoría", "Duración (min)", "Precio (€)"], serviceStore.services.map((s) => [s.id, s.name, s.category, s.duration, s.price]))}
    ${table("Citas", ["ID", "Fecha", "Hora", "Cliente", "Servicio", "Estado", "Pago"], appointmentStore.appointments.map((a) => {
      const start = new Date(a.start);
      return [
        a.id,
        start.toLocaleDateString("es-ES"),
        start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        a.clientName,
        serviceNameById.value.get(a.serviceId ?? "") ?? a.serviceId,
        a.status,
        a.paymentStatus,
      ];
    }))}
  </body>
</html>`.trim();

    downloadFile({
      fileName: `resumen-negocio-${formatDateStamp(new Date())}.xls`,
      content,
      mimeType: "application/vnd.ms-excel;charset=utf-8",
    });
  };

  /**
   * Loads data and immediately downloads the CSV for the given report type.
   * Never fails due to stats API — uses local store data as fallback.
   */
  const downloadReport = async (reportId: string, reportPeriod: SummaryPeriod): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await loadStores();
      setPeriod(reportPeriod);

      switch (reportId) {
        case "clients":
          exportClientsReport();
          break;
        case "sales":
          exportSalesReport();
          break;
        case "daily":
        case "weekly":
        case "monthly":
          exportAppointmentsReport();
          break;
        case "all":
        default:
          exportCsv();
          break;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : t("configReports.reportError");
    } finally {
      loading.value = false;
    }
  };

  return {
    isOpen,
    period,
    loading,
    error,
    appointmentsInPeriod,
    salesInPeriod,
    totalClients,
    totalUsers,
    totalAppointments,
    topServicesInPeriod,
    dashboardHighlights,
    periodSalesLabel,
    periodAppointmentsLabel,
    open,
    close,
    load,
    setPeriod,
    exportCsv,
    exportExcel,
    downloadReport,
  };
};

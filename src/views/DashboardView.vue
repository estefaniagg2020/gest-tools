<template>
  <div class="h-full flex flex-col min-h-0">
    <header class="shrink-0 flex items-center justify-between gap-4 p-4 md:p-6 border-b border-app-border-subtle bg-app-surface">
      <div>
        <h1 class="text-lg font-semibold text-app-title">{{ $t('dashboard.title') }}</h1>
        <p class="text-sm text-app-text/60 mt-0.5">{{ currentDate }}</p>
      </div>
      <RouterLink
        v-if="!showSidebar"
        :to="{ name: 'config' }"
        class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-accent text-white shadow-sm hover:opacity-95 active:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
      >
        <span aria-hidden="true">⚙️</span>
        Configuración
      </RouterLink>
    </header>

    <div class="flex-1 min-h-0 overflow-auto">
      <div class="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
        <section class="rounded-2xl bg-app-surface border border-app-border-subtle shadow-card p-5 md:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-base font-semibold text-app-title">{{ $t('dashboard.tomorrow') }}</h2>
            <RouterLink
              :to="{ name: 'scheduler' }"
              class="text-sm font-medium text-brand-accent hover:underline"
            >
              {{ $t('dashboard.seeAgenda') }} →
            </RouterLink>
          </div>
          <p class="text-sm text-app-text/70 mb-4">
            {{ agendaStats.tomorrowLabel }}
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
              <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboard.occupation') }}</p>
              <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">{{ agendaStats.occupancyPercent }}%</p>
            </div>
            <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
              <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">{{ $t('dashboard.hours') }}</p>
              <p class="mt-1 text-lg font-bold text-app-title tabular-nums">
                {{ agendaStats.occupiedHoursFormatted }}
                <span class="text-xs font-normal text-app-text/60">/ {{ agendaStats.totalHoursFormatted }}</span>
              </p>
            </div>
            <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
              <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">{{ $t('dashboard.blocks') }}</p>
              <p class="mt-1 text-xl font-bold text-app-title tabular-nums">{{ agendaStats.workBlocksCount }}</p>
            </div>
            <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
              <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">{{ $t('dashboard.team') }}</p>
              <p class="mt-1 text-xl font-bold text-app-title tabular-nums">{{ agendaStats.memberCount }}</p>
            </div>
          </div>
          <div v-if="slotsByHour.length > 0" class="mt-4 pt-4 border-t border-app-border-subtle">
            <p class="text-xs font-medium text-app-text/70 mb-2">{{ $t('dashboard.perHour') }}</p>
            <div class="flex gap-1 h-2 rounded-full overflow-hidden bg-app-border-subtle">
              <div
                v-for="row in slotsByHour"
                :key="row.hour"
                class="flex-1 rounded-full bg-brand-accent/80 transition-all"
                :style="{ opacity: 0.3 + (row.percent / 100) * 0.7 }"
                :title="`${row.label}: ${row.count}/${memberCount}`"
              />
            </div>
          </div>
        </section>

        <section v-if="orderedReservaWidgets.length > 0" class="rounded-2xl bg-app-surface border border-app-border-subtle shadow-card p-5 md:p-6">
          <h2 class="text-base font-semibold text-app-title mb-4">{{ $t('dashboard.bookings') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="widget in orderedReservaWidgets"
              :key="widget.id"
              :class="getWidgetColSpan(widget.size ?? 'small')"
            >
              <DashboardWidgetReservasMes
                v-if="widget.id === 'reservas-mes'"
                :count="bookingStats.stats.value?.reservasMes ?? 0"
              />
              <DashboardWidgetReservasSemana
                v-else-if="widget.id === 'reservas-semana'"
                :count="bookingStats.stats.value?.reservasSemana ?? 0"
              />
              <DashboardWidgetBeneficioDiario
                v-else-if="widget.id === 'beneficio-diario'"
                :amount="bookingStats.stats.value?.beneficioHoy ?? 0"
              />
              <DashboardWidgetIngresosMes
                v-else-if="widget.id === 'ingresos-mes'"
                :amount="bookingStats.stats.value?.ingresosMes ?? 0"
              />
              <DashboardWidgetReservasCanceladas
                v-else-if="widget.id === 'reservas-canceladas'"
                :count="bookingStats.stats.value?.reservasCanceladas ?? 0"
              />
              <DashboardWidgetTasaCancelacion
                v-else-if="widget.id === 'tasa-cancelacion'"
                :rate="bookingStats.stats.value?.tasaCancelacion ?? 0"
              />
              <DashboardWidgetClientesNuevos
                v-else-if="widget.id === 'clientes-nuevos'"
                :count="bookingStats.stats.value?.clientesNuevos ?? 0"
              />
              <DashboardWidgetOcupacionSemanal
                v-else-if="widget.id === 'ocupacion-semanal'"
                :rate="bookingStats.stats.value?.ocupacionSemanal ?? 0"
              />
              <DashboardWidgetHorasTrabajadas
                v-else-if="widget.id === 'horas-trabajadas'"
                :hours="bookingStats.stats.value?.horasTrabajadasSemana ?? 0"
              />
              <DashboardWidgetEmpleadoMasReservas
                v-else-if="widget.id === 'empleado-mas-reservas'"
                :data="bookingStats.stats.value?.empleadoMasReservas ?? null"
              />
              <DashboardWidgetGraficaReservasPersona
                v-else-if="widget.id === 'grafica-reservas-persona'"
                :data="graficaReservasPersonaData"
              />
              <DashboardWidgetVentasPorEmpleado
                v-else-if="widget.id === 'ventas-por-empleado'"
                :data="bookingStats.stats.value?.ventasPorEmpleado ?? []"
              />
              <DashboardWidgetServiciosPopulares
                v-else-if="widget.id === 'servicios-populares'"
                :data="bookingStats.stats.value?.serviciosPopulares ?? []"
              />
              <DashboardWidgetProximasCitasHoy
                v-else-if="widget.id === 'proximas-citas-hoy'"
                :data="bookingStats.stats.value?.proximasCitasHoy ?? []"
              />
              <DashboardWidgetProductosBajoStock
                v-else-if="widget.id === 'productos-bajo-stock'"
                :data="bookingStats.stats.value?.productosBajoStock ?? []"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { storeToRefs } from "pinia";
  import { RouterLink, useRoute } from "vue-router";
  import { orderDashboardWidgetsByIds, getWidgetColSpan } from "@/data/dashboardWidgetModules";
  import { DEFAULT_DASHBOARD_MODULE_IDS } from "@/interfaces/layoutConfig";
  import { useDashboardAgendaStats } from "@/composables/useDashboardAgendaStats";
  import { useDashboardBookingStats } from "@/composables/useDashboardBookingStats";
  import { useAuthStore } from "@/stores/auth";
  import { useLayoutStore } from "@/stores/layout";
  import { useScheduleStore } from "@/stores/schedule";
  import { useTeamStore } from "@/stores/team";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
  import DashboardWidgetReservasMes from "@/components/dashboard/DashboardWidgetReservasMes.vue";
  import DashboardWidgetReservasSemana from "@/components/dashboard/DashboardWidgetReservasSemana.vue";
  import DashboardWidgetBeneficioDiario from "@/components/dashboard/DashboardWidgetBeneficioDiario.vue";
  import DashboardWidgetIngresosMes from "@/components/dashboard/DashboardWidgetIngresosMes.vue";
  import DashboardWidgetReservasCanceladas from "@/components/dashboard/DashboardWidgetReservasCanceladas.vue";
  import DashboardWidgetTasaCancelacion from "@/components/dashboard/DashboardWidgetTasaCancelacion.vue";
  import DashboardWidgetGraficaReservasPersona from "@/components/dashboard/DashboardWidgetGraficaReservasPersona.vue";
  import DashboardWidgetEmpleadoMasReservas from "@/components/dashboard/DashboardWidgetEmpleadoMasReservas.vue";
  import DashboardWidgetVentasPorEmpleado from "@/components/dashboard/DashboardWidgetVentasPorEmpleado.vue";
  import DashboardWidgetServiciosPopulares from "@/components/dashboard/DashboardWidgetServiciosPopulares.vue";
  import DashboardWidgetClientesNuevos from "@/components/dashboard/DashboardWidgetClientesNuevos.vue";
  import DashboardWidgetProximasCitasHoy from "@/components/dashboard/DashboardWidgetProximasCitasHoy.vue";
  import DashboardWidgetOcupacionSemanal from "@/components/dashboard/DashboardWidgetOcupacionSemanal.vue";
  import DashboardWidgetHorasTrabajadas from "@/components/dashboard/DashboardWidgetHorasTrabajadas.vue";
  import DashboardWidgetProductosBajoStock from "@/components/dashboard/DashboardWidgetProductosBajoStock.vue";

  const { locale } = useI18n();
  const LOCALE_MAP: Record<string, string> = {
    es: "es-ES",
    ca: "ca-ES",
    en: "en-GB",
    de: "de-DE",
  };
  const currentDate = computed(() => {
    const localeTag = LOCALE_MAP[locale.value] ?? "es-ES";
    return new Date().toLocaleDateString(localeTag, { weekday: "long", day: "numeric", month: "long" });
  });

  const route = useRoute();
  const layoutStore = useLayoutStore();
  const authStore = useAuthStore();
  const { dashboardModuleIds, showSidebar } = storeToRefs(layoutStore);
  const { user } = storeToRefs(authStore);

  const widgetIdsForDisplay = computed(() => {
    const ids = dashboardModuleIds.value;
    return ids.length > 0 ? ids : [...DEFAULT_DASHBOARD_MODULE_IDS];
  });

  const orderedReservaWidgets = computed(() =>
    orderDashboardWidgetsByIds(widgetIdsForDisplay.value),
  );

  const syncLayoutFromStorage = () => {
    const uid = user.value?.id;
    if (uid) layoutStore.initialize(uid);
  };

  watch(
    () => route.name,
    (name) => {
      if (name === "dashboard") syncLayoutFromStorage();
    },
    { immediate: true },
  );

  watch(user, (u) => {
    if (u?.id && route.name === "dashboard") syncLayoutFromStorage();
  }, { immediate: true });

  const bookingStats = useDashboardBookingStats();
  const graficaReservasPersonaData = computed(() => {
    const list = bookingStats.stats.value?.reservasPorPersona ?? [];
    return list.map((item) => ({
      label: item.employeeName ?? "Sin asignar",
      count: item.count,
    }));
  });

  const agendaStats = useDashboardAgendaStats();
  const slotsByHour = computed(() => agendaStats.slotsByHour.value);
  const memberCount = computed(() => agendaStats.memberCount.value);

  onMounted(() => {
    syncLayoutFromStorage();
    useScheduleStore().initialize();
    useTeamStore().initialize();
    useSchedulerSettingsStore().initialize();
  });
</script>

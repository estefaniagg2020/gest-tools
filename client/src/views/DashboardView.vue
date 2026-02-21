<template>
  <div class="h-full flex flex-col min-h-0">
    <header class="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 lg:p-6 border-b border-app-border-subtle bg-app-surface">
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
        {{ $t('nav.config') }}
      </RouterLink>
    </header>

    <div class="flex-1 min-h-0 overflow-auto">
      <div class="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-8">
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
          <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <div class="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-3 md:gap-4">
            <div
              v-for="widget in orderedReservaWidgets"
              :key="widget.id"
              :class="[
                `dashboard-widget-cell ${getWidgetColSpan(widget.size ?? 'small')}`,
                'relative cursor-grab active:cursor-grabbing select-none transition-opacity duration-150',
                draggedId === widget.id ? 'opacity-30 scale-95' : '',
                dropTargetId === widget.id && draggedId !== widget.id ? 'ring-2 ring-brand-accent rounded-xl' : '',
              ]"
              draggable="true"
              @dragstart="onDragStart($event, widget.id)"
              @dragover="onDragOver($event, widget.id)"
              @dragleave="onDragLeave"
              @drop="onDrop($event, widget.id)"
              @dragend="onDragEnd"
            >
              <DashboardWidgetMonthlyBookings
                v-if="widget.id === 'reservas-mes'"
                :count="bookingStats.stats.value?.reservasMes ?? 0"
              />
              <DashboardWidgetWeeklyBookings
                v-else-if="widget.id === 'reservas-semana'"
                :count="bookingStats.stats.value?.reservasSemana ?? 0"
              />
              <DashboardWidgetDailyProfit
                v-else-if="widget.id === 'beneficio-diario'"
                :amount="bookingStats.stats.value?.beneficioHoy ?? 0"
              />
              <DashboardWidgetMonthlyIncome
                v-else-if="widget.id === 'ingresos-mes'"
                :amount="bookingStats.stats.value?.ingresosMes ?? 0"
              />
              <DashboardWidgetCancelledBookings
                v-else-if="widget.id === 'reservas-canceladas'"
                :count="bookingStats.stats.value?.reservasCanceladas ?? 0"
              />
              <DashboardWidgetCancellationRate
                v-else-if="widget.id === 'tasa-cancelacion'"
                :rate="bookingStats.stats.value?.tasaCancelacion ?? 0"
              />
              <DashboardWidgetNewClients
                v-else-if="widget.id === 'clientes-nuevos'"
                :count="bookingStats.stats.value?.clientesNuevos ?? 0"
              />
              <DashboardWidgetWeeklyOccupancy
                v-else-if="widget.id === 'ocupacion-semanal'"
                :rate="bookingStats.stats.value?.ocupacionSemanal ?? 0"
              />
              <DashboardWidgetHoursWorked
                v-else-if="widget.id === 'horas-trabajadas'"
                :hours="bookingStats.stats.value?.horasTrabajadasSemana ?? 0"
              />
              <DashboardWidgetTopBookingsEmployee
                v-else-if="widget.id === 'empleado-mas-reservas'"
                :data="bookingStats.stats.value?.empleadoMasReservas ?? null"
              />
              <DashboardWidgetTodayAppointments
                v-else-if="widget.id === 'proximas-citas-hoy'"
                :data="bookingStats.stats.value?.proximasCitasHoy ?? []"
              />
              <DashboardWidgetLowStockProducts
                v-else-if="widget.id === 'productos-bajo-stock'"
                :data="bookingStats.stats.value?.productosBajoStock ?? []"
              />
              <DashboardWidgetListaEspera
                v-else-if="widget.id === 'lista-espera'"
                :data="bookingStats.stats.value?.listaEspera ?? []"
              />
              <DashboardWidgetBookingsPerPerson
                v-else-if="widget.id === 'grafica-reservas-persona'"
                :data="graficaReservasPersonaData"
              />
              <DashboardWidgetSalesPerEmployee
                v-else-if="widget.id === 'ventas-por-empleado'"
                :data="bookingStats.stats.value?.ventasPorEmpleado ?? []"
              />
              <DashboardWidgetPopularServices
                v-else-if="widget.id === 'servicios-populares'"
                :data="bookingStats.stats.value?.serviciosPopulares ?? []"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from "vue";
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
  import DashboardWidgetMonthlyBookings from "@/components/dashboard/DashboardWidgetMonthlyBookings.vue";
  import DashboardWidgetWeeklyBookings from "@/components/dashboard/DashboardWidgetWeeklyBookings.vue";
  import DashboardWidgetDailyProfit from "@/components/dashboard/DashboardWidgetDailyProfit.vue";
  import DashboardWidgetMonthlyIncome from "@/components/dashboard/DashboardWidgetMonthlyIncome.vue";
  import DashboardWidgetCancelledBookings from "@/components/dashboard/DashboardWidgetCancelledBookings.vue";
  import DashboardWidgetCancellationRate from "@/components/dashboard/DashboardWidgetCancellationRate.vue";
  import DashboardWidgetBookingsPerPerson from "@/components/dashboard/DashboardWidgetBookingsPerPerson.vue";
  import DashboardWidgetTopBookingsEmployee from "@/components/dashboard/DashboardWidgetTopBookingsEmployee.vue";
  import DashboardWidgetSalesPerEmployee from "@/components/dashboard/DashboardWidgetSalesPerEmployee.vue";
  import DashboardWidgetPopularServices from "@/components/dashboard/DashboardWidgetPopularServices.vue";
  import DashboardWidgetNewClients from "@/components/dashboard/DashboardWidgetNewClients.vue";
  import DashboardWidgetTodayAppointments from "@/components/dashboard/DashboardWidgetTodayAppointments.vue";
  import DashboardWidgetWeeklyOccupancy from "@/components/dashboard/DashboardWidgetWeeklyOccupancy.vue";
  import DashboardWidgetHoursWorked from "@/components/dashboard/DashboardWidgetHoursWorked.vue";
  import DashboardWidgetLowStockProducts from "@/components/dashboard/DashboardWidgetLowStockProducts.vue";
  import DashboardWidgetListaEspera from "@/components/dashboard/DashboardWidgetListaEspera.vue";

  const { locale, t } = useI18n();
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

  // Drag-and-drop widget reorder
  const draggedId = ref<string | null>(null);
  const dropTargetId = ref<string | null>(null);

  const onDragStart = (e: DragEvent, id: string) => {
    draggedId.value = id;
    e.dataTransfer!.effectAllowed = "move";
  };

  const onDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    if (dropTargetId.value !== id) dropTargetId.value = id;
  };

  const onDragLeave = () => {
    dropTargetId.value = null;
  };

  const onDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    const from = draggedId.value;
    if (!from || from === targetId) return;
    const ids = [...widgetIdsForDisplay.value];
    const fromIdx = ids.indexOf(from);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, from);
    layoutStore.setDashboardModuleIds(ids);
    draggedId.value = null;
    dropTargetId.value = null;
  };

  const onDragEnd = () => {
    draggedId.value = null;
    dropTargetId.value = null;
  };

  const bookingStats = useDashboardBookingStats();
  const graficaReservasPersonaData = computed(() => {
    const list = bookingStats.stats.value?.reservasPorPersona ?? [];
    return list.map((item) => ({
      label: item.employeeName ?? t("scheduler.unassigned"),
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

<style scoped>
  .dashboard-widget-cell > * {
    height: 100%;
  }
</style>

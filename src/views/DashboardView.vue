<template>
  <div class="h-full flex flex-col min-h-0">
    <header class="shrink-0 flex items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-200/80 bg-app-surface">
      <div>
        <h1 class="text-lg font-semibold text-app-title">Panel de control</h1>
        <p class="text-sm text-app-text/60 mt-0.5">{{ currentDate }}</p>
      </div>
      <RouterLink
        :to="{ name: 'config' }"
        class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-spa-teal text-white shadow-sm hover:opacity-95 active:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-spa-teal focus:ring-offset-2"
      >
        <span aria-hidden="true">⚙️</span>
        Configuración
      </RouterLink>
    </header>

    <div class="flex-1 min-h-0 overflow-auto">
      <div class="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
        <section class="rounded-2xl bg-linear-to-br from-teal-50/80 to-app-surface border border-teal-100/60 p-5 md:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-base font-semibold text-app-title">Mañana</h2>
            <RouterLink
              :to="{ name: 'scheduler' }"
              class="text-sm font-medium text-spa-teal hover:underline"
            >
              Ver agenda →
            </RouterLink>
          </div>
          <p class="text-sm text-app-text/70 mb-4">
            {{ agendaStats.tomorrowLabel }}
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="rounded-xl bg-white/70 backdrop-blur border border-teal-100/50 p-4">
              <p class="text-[11px] font-medium text-teal-600 uppercase tracking-wider">Ocupación</p>
              <p class="mt-1 text-xl font-bold text-teal-700 tabular-nums">{{ agendaStats.occupancyPercent }}%</p>
            </div>
            <div class="rounded-xl bg-white/70 backdrop-blur border border-gray-100 p-4">
              <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">Horas</p>
              <p class="mt-1 text-lg font-bold text-app-title tabular-nums">
                {{ agendaStats.occupiedHoursFormatted }}
                <span class="text-xs font-normal text-app-text/60">/ {{ agendaStats.totalHoursFormatted }}</span>
              </p>
            </div>
            <div class="rounded-xl bg-white/70 backdrop-blur border border-gray-100 p-4">
              <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">Bloques</p>
              <p class="mt-1 text-xl font-bold text-app-title tabular-nums">{{ agendaStats.workBlocksCount }}</p>
            </div>
            <div class="rounded-xl bg-white/70 backdrop-blur border border-gray-100 p-4">
              <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">Equipo</p>
              <p class="mt-1 text-xl font-bold text-app-title tabular-nums">{{ agendaStats.therapistCount }}</p>
            </div>
          </div>
          <div v-if="slotsByHour.length > 0" class="mt-4 pt-4 border-t border-teal-100/50">
            <p class="text-xs font-medium text-app-text/70 mb-2">Por hora</p>
            <div class="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
              <div
                v-for="row in slotsByHour"
                :key="row.hour"
                class="flex-1 rounded-full bg-spa-teal/80 transition-all"
                :style="{ opacity: 0.3 + (row.percent / 100) * 0.7 }"
                :title="`${row.label}: ${row.count}/${therapistCount}`"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-base font-semibold text-app-title mb-3">Accesos rápidos</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RouterLink
              v-for="card in DASHBOARD_CARDS"
              :key="card.id"
              :to="card.to"
              class="group flex items-center gap-4 rounded-xl border border-gray-200/80 bg-app-surface p-4 hover:border-spa-teal/40 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-spa-teal/30 focus:ring-offset-2"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl bg-gray-100 group-hover:bg-teal-50 transition-colors"
              >
                {{ card.icon }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-app-title group-hover:text-spa-teal transition-colors">{{ card.title }}</p>
                <p class="text-xs text-app-text/60 truncate">{{ card.description }}</p>
              </div>
              <span class="shrink-0 text-gray-300 group-hover:text-spa-teal transition-colors">→</span>
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from "vue";
  import { RouterLink } from "vue-router";
  import { DASHBOARD_CARDS } from "@/data/dashboardModules";
  import { useDashboardAgendaStats } from "@/composables/useDashboardAgendaStats";
  import { useScheduleStore } from "@/stores/schedule";
  import { useTherapistStore } from "@/stores/therapist";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";

  const currentDate = computed(() =>
    new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
  );

  const agendaStats = useDashboardAgendaStats();
  const slotsByHour = computed(() => agendaStats.slotsByHour.value);
  const therapistCount = computed(() => agendaStats.therapistCount.value);

  onMounted(() => {
    useScheduleStore().initialize();
    useTherapistStore().initialize();
    useSchedulerSettingsStore().initialize();
  });
</script>

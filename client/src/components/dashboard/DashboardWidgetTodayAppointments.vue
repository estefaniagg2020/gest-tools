<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider mb-3">{{ $t('dashboardWidgets.proximasCitasHoy') }}</p>
    <div v-if="data.length === 0" class="flex items-center gap-2 text-sm text-app-text/60">
      <span class="text-base">✓</span>
      {{ $t('dashboardWidgets.noMoreAppointmentsToday') }}
    </div>
    <div v-else class="space-y-2">
      <div v-for="cita in data" :key="cita.id" class="flex items-center gap-2.5">
        <span class="text-[11px] font-bold text-brand-accent tabular-nums shrink-0 w-10 text-right">
          {{ formatHour(cita.start) }}
        </span>
        <div class="w-px h-5 rounded-full bg-brand-accent/30 shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-app-title truncate">{{ cita.serviceName }}</p>
          <p v-if="cita.employeeName" class="text-[10px] text-app-text/50 truncate">{{ cita.employeeName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIntlLocale } from "@/utils/intlLocale";
import type { ProximaCitaItem } from "@/interfaces/dashboardStats";

defineProps<{ data: ProximaCitaItem[] }>();

const formatHour = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString(getIntlLocale(), { hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.empleadoMasReservas') }}</p>
    <div v-if="!data" class="mt-2 text-sm text-app-text/60">{{ $t('dashboardWidgets.noData') }}</div>
    <div v-else class="mt-2 flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-xl shrink-0">
        🏆
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-app-title truncate">{{ data.employeeName ?? $t('dashboardWidgets.unassigned') }}</p>
        <p class="text-xs font-semibold text-brand-accent tabular-nums">
          {{ data.count }} {{ $t('dashboardWidgets.reservasSuffix') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmpleadoMasReservasItem } from "@/interfaces/dashboardStats";

defineProps<{ data: EmpleadoMasReservasItem | null }>();
</script>

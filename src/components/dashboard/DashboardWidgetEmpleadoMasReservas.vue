<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">Empleado con más reservas</p>
    <div v-if="!data" class="mt-1 text-sm text-app-text/60">Sin datos</div>
    <div v-else class="mt-2 flex items-center gap-3">
      <span class="text-2xl" aria-hidden="true">🏆</span>
      <div>
        <p class="text-base font-bold text-app-title">{{ data.employeeName ?? "Sin asignar" }}</p>
        <p class="text-sm font-semibold text-brand-accent tabular-nums">{{ data.count }} reservas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmpleadoMasReservasItem } from "@/interfaces/dashboardStats";

defineProps<{
  data: EmpleadoMasReservasItem | null;
}>();
</script>

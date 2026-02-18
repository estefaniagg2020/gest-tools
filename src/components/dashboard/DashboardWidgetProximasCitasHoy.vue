<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider mb-3">Próximas citas</p>
    <div v-if="data.length === 0" class="text-sm text-app-text/60">No hay más citas hoy</div>
    <div v-else class="space-y-2">
      <div
        v-for="cita in data"
        :key="cita.id"
        class="flex items-center gap-3"
      >
        <span class="text-xs font-bold text-brand-accent tabular-nums shrink-0 w-12">{{ formatHour(cita.start) }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-app-title truncate">{{ cita.serviceName }}</p>
          <p v-if="cita.employeeName" class="text-[11px] text-app-text/60 truncate">{{ cita.employeeName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProximaCitaItem } from "@/interfaces/dashboardStats";

defineProps<{
  data: ProximaCitaItem[];
}>();

const formatHour = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};
</script>

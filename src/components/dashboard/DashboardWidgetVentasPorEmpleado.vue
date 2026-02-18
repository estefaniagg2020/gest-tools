<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider mb-3">Ventas por empleado</p>
    <div v-if="data.length === 0" class="text-sm text-app-text/60">Sin datos</div>
    <div v-else class="space-y-2">
      <div
        v-for="(item, i) in data"
        :key="item.employeeId ?? 'sin-asignar'"
        class="flex items-center gap-2"
      >
        <span class="text-xs font-semibold text-app-text/40 w-4 shrink-0">{{ i + 1 }}</span>
        <span class="text-sm text-app-title truncate min-w-0 flex-1" :title="item.employeeName ?? 'Sin asignar'">{{ item.employeeName ?? "Sin asignar" }}</span>
        <span class="text-sm font-semibold text-brand-accent tabular-nums shrink-0">{{ formatted(item.amount) }}</span>
        <div class="w-16 h-2 rounded-full bg-app-border-subtle overflow-hidden shrink-0">
          <div
            class="h-full rounded-full bg-brand-accent/80"
            :style="{ width: barWidth(item.amount) }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VentasPorEmpleadoItem } from "@/interfaces/dashboardStats";

const props = defineProps<{
  data: VentasPorEmpleadoItem[];
}>();

const formatted = (amount: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

const maxAmount = computed(() =>
  props.data.length ? Math.max(...props.data.map((d) => d.amount), 1) : 1,
);

const barWidth = (amount: number) =>
  `${Math.round((amount / maxAmount.value) * 100)}%`;
</script>

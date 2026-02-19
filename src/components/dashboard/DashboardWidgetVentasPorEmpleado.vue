<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4 flex flex-col min-h-52">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider mb-4 shrink-0">
      {{ $t('dashboardWidgets.ventasPorEmpleado') }}
    </p>
    <div v-if="data.length === 0" class="flex-1 flex items-center justify-center text-sm text-app-text/60">
      {{ $t('dashboardWidgets.noData') }}
    </div>
    <div v-else class="flex-1 flex flex-col justify-around gap-3">
      <div v-for="(item, i) in data" :key="item.employeeId ?? 'sin-asignar'" class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              :style="{ backgroundColor: colors[i % colors.length] }"
            >{{ i + 1 }}</span>
            <span class="text-xs font-semibold text-app-title truncate"
              :title="item.employeeName ?? $t('dashboardWidgets.unassigned')">
              {{ item.employeeName ?? $t('dashboardWidgets.unassigned') }}
            </span>
          </div>
          <span class="text-xs font-bold tabular-nums shrink-0" :style="{ color: colors[i % colors.length] }">
            {{ formatted(item.amount) }}
          </span>
        </div>
        <div class="h-4 rounded-full bg-app-border-subtle overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: barWidth(item.amount), backgroundColor: colors[i % colors.length] + '99' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getIntlLocale } from "@/utils/intlLocale";
import type { VentasPorEmpleadoItem } from "@/interfaces/dashboardStats";

const props = defineProps<{ data: VentasPorEmpleadoItem[] }>();

const colors = ["#60a5fa", "#34d399", "#f87171", "#a78bfa", "#fbbf24"];

const formatted = (amount: number) =>
  new Intl.NumberFormat(getIntlLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

const maxAmount = computed(() =>
  props.data.length ? Math.max(...props.data.map((d) => d.amount), 1) : 1,
);

const barWidth = (amount: number) =>
  `${Math.max(4, Math.round((amount / maxAmount.value) * 100))}%`;
</script>

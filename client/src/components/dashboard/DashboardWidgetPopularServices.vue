<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-5 flex flex-col min-h-64">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider mb-4 shrink-0">
      {{ $t('dashboardWidgets.serviciosPopulares') }}
    </p>
    <div v-if="data.length === 0" class="flex-1 flex items-center justify-center text-sm text-app-text/60">
      {{ $t('dashboardWidgets.noData') }}
    </div>
    <div v-else class="flex-1 flex flex-col justify-around gap-3.5">
      <div v-for="(item, i) in data" :key="item.serviceId" class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-base shrink-0 leading-none">{{ medals[i] ?? String(i + 1) }}</span>
            <span class="text-xs font-semibold text-app-title truncate" :title="item.serviceName">
              {{ item.serviceName }}
            </span>
          </div>
          <span class="text-xs font-bold text-brand-accent tabular-nums shrink-0">
            {{ item.count }} {{ $t('dashboardWidgets.reservasSuffix') }}
          </span>
        </div>
        <div class="h-5 rounded-full bg-app-border-subtle overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: barWidth(item.count), backgroundColor: barColors[i % barColors.length] }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ServicioPopularItem } from "@/interfaces/dashboardStats";

const props = defineProps<{ data: ServicioPopularItem[] }>();

const medals = ["🥇", "🥈", "🥉"];
const barColors = ["#fbbf24cc", "#22c55ecc", "#a855f7cc", "#0ea5e9cc", "#f97316cc"];

const maxCount = computed(() =>
  props.data.length ? Math.max(...props.data.map((d) => d.count), 1) : 1,
);

const barWidth = (count: number) =>
  `${Math.max(4, Math.round((count / maxCount.value) * 100))}%`;
</script>

<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4 flex flex-col min-h-52">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider mb-4 shrink-0">
      {{ $t('dashboardWidgets.graficaReservasPersona') }}
    </p>
    <div v-if="data.length === 0" class="flex-1 flex items-center justify-center text-sm text-app-text/60">
      {{ $t('dashboardWidgets.noData') }}
    </div>
    <div v-else class="flex-1 flex items-end justify-around gap-3 pb-1">
      <div
        v-for="(item, i) in data"
        :key="item.label"
        class="flex flex-col items-center gap-1.5 flex-1 h-full justify-end"
      >
        <span class="text-xs font-bold tabular-nums" :style="{ color: colors[i % colors.length] }">
          {{ item.count }}
        </span>
        <div
          class="w-full rounded-t-lg min-h-[6px] transition-all duration-700"
          :style="{ height: barHeight(item.count), backgroundColor: colors[i % colors.length] + 'b0' }"
        />
        <span class="text-[10px] text-app-title truncate w-full text-center leading-tight" :title="item.label">
          {{ firstName(item.label) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: { label: string; count: number }[];
}>();

const colors = ["#60a5fa", "#34d399", "#f87171", "#a78bfa", "#fbbf24", "#f472b6"];

const maxCount = computed(() =>
  props.data.length ? Math.max(...props.data.map((d) => d.count), 1) : 1,
);

const barHeight = (count: number) =>
  `${Math.max(6, Math.round((count / maxCount.value) * 100))}%`;

const firstName = (name: string) => name.split(" ")[0];
</script>

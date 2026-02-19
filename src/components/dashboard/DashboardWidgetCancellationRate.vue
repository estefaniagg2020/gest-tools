<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">{{ $t('dashboardWidgets.tasaCancelacion') }}</p>
        <p class="mt-1 text-2xl font-bold tabular-nums" :class="colorClass">{{ rate }}%</p>
        <p class="text-[10px] mt-0.5" :class="labelClass">{{ statusLabel }}</p>
      </div>
      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0" :class="iconBgClass">
        {{ icon }}
      </div>
    </div>
    <div class="mt-3 h-1.5 rounded-full bg-app-border-subtle overflow-hidden">
      <div class="h-full rounded-full transition-all duration-500" :class="barClass" :style="{ width: rate + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ rate: number }>();

const colorClass = computed(() =>
  props.rate > 20 ? "text-red-500" : props.rate > 10 ? "text-amber-500" : "text-emerald-500",
);
const barClass = computed(() =>
  props.rate > 20 ? "bg-red-400" : props.rate > 10 ? "bg-amber-400" : "bg-emerald-400/70",
);
const iconBgClass = computed(() =>
  props.rate > 20 ? "bg-red-500/10" : props.rate > 10 ? "bg-amber-500/10" : "bg-emerald-500/10",
);
const labelClass = computed(() =>
  props.rate > 20 ? "text-red-400/70" : props.rate > 10 ? "text-amber-400/70" : "text-emerald-400/70",
);
const icon = computed(() => (props.rate > 20 ? "⚠️" : props.rate > 10 ? "⚡" : "✅"));
const statusLabel = computed(() =>
  props.rate > 20 ? "High" : props.rate > 10 ? "Medium" : "Low",
);
</script>

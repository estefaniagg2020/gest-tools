<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.ocupacionSemanal') }}</p>
        <p class="mt-1 text-2xl font-bold text-brand-accent tabular-nums">{{ rate }}%</p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-brand-accent/10 flex items-center justify-center text-xl shrink-0">
        📅
      </div>
    </div>
    <div class="mt-3 h-2 rounded-full bg-app-border-subtle overflow-hidden">
      <div class="h-full rounded-full bg-brand-accent/80 transition-all duration-500"
        :style="{ width: rate + '%' }" />
    </div>
    <p class="mt-1.5 text-[10px] text-app-text/50">of weekly capacity</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ rate: number }>();
</script>

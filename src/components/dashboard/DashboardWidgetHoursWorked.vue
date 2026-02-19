<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.horasTrabajadas') }}</p>
        <div class="flex items-baseline gap-1 mt-1">
          <p class="text-2xl font-bold text-brand-accent tabular-nums">{{ hours }}</p>
          <span class="text-xs text-app-text/60">{{ $t('dashboardWidgets.hThisWeek') }}</span>
        </div>
      </div>
      <div class="w-9 h-9 rounded-xl bg-brand-accent/10 flex items-center justify-center text-xl shrink-0">
        ⏱️
      </div>
    </div>
    <div class="mt-3 flex items-end gap-0.5 h-6">
      <span v-for="(h, i) in [80, 90, 70, 85, 60]" :key="i"
        class="flex-1 rounded-sm bg-brand-accent/40"
        :style="{ height: h + '%' }" />
      <span v-for="i in 2" :key="'w' + i"
        class="flex-1 rounded-sm bg-app-border-subtle"
        style="height: 10%" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hours: number }>();
</script>

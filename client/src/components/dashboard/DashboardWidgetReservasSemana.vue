<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.reservasSemana') }}</p>
        <p class="mt-1 text-2xl font-bold text-brand-accent tabular-nums">{{ count }}</p>
        <p class="text-[10px] text-app-text/50 mt-0.5">M · T · W · T · F</p>
      </div>
      <div class="flex items-end gap-0.5 h-10 shrink-0 self-center">
        <span v-for="(h, i) in [70, 50, 85, 60, 90]" :key="i"
          class="w-2 rounded-full bg-brand-accent/40"
          :style="{ height: h + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>();
</script>

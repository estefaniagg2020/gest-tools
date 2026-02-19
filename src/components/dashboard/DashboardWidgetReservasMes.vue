<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.reservasMes') }}</p>
        <p class="mt-1 text-2xl font-bold text-brand-accent tabular-nums">{{ count }}</p>
        <p class="text-[10px] text-app-text/50 mt-0.5">{{ $t('dashboardWidgets.thisMonth') }}</p>
      </div>
      <div class="flex items-end gap-0.5 h-10 shrink-0 self-center">
        <span v-for="(h, i) in [40, 60, 35, 80, 55, 70, 90]" :key="i"
          class="w-1.5 rounded-full bg-brand-accent/40"
          :style="{ height: h + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>();
</script>

<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.clientesNuevos') }}</p>
        <div class="flex items-baseline gap-1 mt-1">
          <p class="text-2xl font-bold text-brand-accent tabular-nums">{{ count }}</p>
          <span class="text-[10px] text-app-text/50">{{ $t('dashboardWidgets.thisMonth') }}</span>
        </div>
      </div>
      <div class="w-9 h-9 rounded-xl bg-brand-accent/10 flex items-center justify-center text-xl shrink-0">
        👥
      </div>
    </div>
    <div class="mt-3 flex gap-1 flex-wrap">
      <span v-for="i in Math.min(count, 12)" :key="i"
        class="h-2 w-2 rounded-full bg-brand-accent/50" />
      <span v-for="i in Math.max(0, 12 - count)" :key="'e' + i"
        class="h-2 w-2 rounded-full bg-app-border-subtle" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>();
</script>

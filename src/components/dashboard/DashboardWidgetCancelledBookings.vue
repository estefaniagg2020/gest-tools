<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">{{ $t('dashboardWidgets.reservasCanceladas') }}</p>
        <p class="mt-1 text-2xl font-bold text-app-title tabular-nums">{{ count }}</p>
        <p class="text-[10px] text-app-text/50 mt-0.5">{{ $t('dashboardWidgets.thisMonth') }}</p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-base font-bold text-red-400 shrink-0">
        ✕
      </div>
    </div>
    <div class="mt-3 flex gap-1">
      <span v-for="i in 5" :key="i"
        class="h-1.5 flex-1 rounded-full"
        :class="i <= Math.min(count, 5) ? 'bg-red-400/60' : 'bg-app-border-subtle'" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>();
</script>

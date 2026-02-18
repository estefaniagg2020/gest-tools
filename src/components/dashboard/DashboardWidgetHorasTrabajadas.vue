<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">Horas trabajadas</p>
    <div class="mt-1 flex items-baseline gap-1">
      <p class="text-xl font-bold text-brand-accent tabular-nums">{{ hours }}</p>
      <span class="text-xs text-app-text/60">h esta semana</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hours: number;
}>();
</script>

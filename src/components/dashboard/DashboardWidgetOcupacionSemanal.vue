<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">Ocupación semanal</p>
    <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">{{ rate }}%</p>
    <div class="mt-2 h-2 rounded-full bg-app-border-subtle overflow-hidden">
      <div
        class="h-full rounded-full bg-brand-accent/80 transition-all duration-500"
        :style="{ width: rate + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rate: number;
}>();
</script>

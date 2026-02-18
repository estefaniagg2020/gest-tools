<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-app-text/60 uppercase tracking-wider">Tasa de cancelación</p>
    <p
      class="mt-1 text-xl font-bold tabular-nums"
      :class="rate > 20 ? 'text-red-500' : rate > 10 ? 'text-amber-500' : 'text-emerald-500'"
    >
      {{ rate }}%
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rate: number;
}>();
</script>

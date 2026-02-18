<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">Reservas de la semana</p>
    <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">{{ count }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
}>();
</script>

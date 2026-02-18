<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">Ingresos del mes</p>
    <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">{{ formatted }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  amount: number;
}>();

const formatted = computed(() =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(props.amount),
);
</script>

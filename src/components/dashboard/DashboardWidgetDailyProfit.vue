<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.beneficioDiario') }}</p>
        <div class="flex items-baseline gap-1.5 mt-1">
          <p class="text-2xl font-bold text-brand-accent tabular-nums">{{ formatted }}</p>
        </div>
        <p class="text-[10px] text-app-text/50 mt-0.5">today</p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">
        💰
      </div>
    </div>
    <div class="mt-3 h-1.5 rounded-full bg-app-border-subtle overflow-hidden">
      <div class="h-full rounded-full bg-emerald-400/70" style="width: 60%" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getIntlLocale } from "@/utils/intlLocale";

const props = defineProps<{ amount: number }>();

const formatted = computed(() =>
  new Intl.NumberFormat(getIntlLocale(), { style: "currency", currency: "EUR" }).format(props.amount),
);
</script>

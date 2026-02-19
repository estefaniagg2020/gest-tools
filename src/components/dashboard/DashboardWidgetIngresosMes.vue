<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">{{ $t('dashboardWidgets.ingresosMes') }}</p>
        <p class="mt-1 text-2xl font-bold text-brand-accent tabular-nums">{{ formatted }}</p>
        <p class="text-[10px] text-app-text/50 mt-0.5">{{ $t('dashboardWidgets.thisMonth') }}</p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-brand-accent/10 flex items-center justify-center text-xl shrink-0">
        📈
      </div>
    </div>
    <div class="mt-3 flex items-end gap-0.5 h-6">
      <span v-for="(h, i) in [30, 45, 55, 40, 65, 50, 70, 80, 60, 75, 85, 90]" :key="i"
        class="flex-1 rounded-sm bg-brand-accent/30"
        :style="{ height: h + '%' }" />
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

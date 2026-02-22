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
    <div v-if="clients.length === 0" class="mt-3 text-xs text-app-text/60">
      {{ $t('dashboardWidgets.noData') }}
    </div>
    <div v-else class="mt-3 space-y-1.5">
      <div v-for="client in clients" :key="client.id" class="flex items-center gap-2.5">
        <span class="text-[10px] font-semibold text-brand-accent tabular-nums shrink-0 w-12 text-right">
          {{ formatDate(client.createdAt) }}
        </span>
        <div class="w-px h-4 rounded-full bg-brand-accent/30 shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-app-title truncate">{{ client.name }}</p>
          <p v-if="client.phone || client.email" class="text-[10px] text-app-text/50 truncate">
            {{ client.phone || client.email }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClienteNuevoItem } from "@/interfaces/dashboardStats";
import { getIntlLocale } from "@/utils/intlLocale";

defineProps<{
  count: number;
  clients: ClienteNuevoItem[];
}>();

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString(getIntlLocale(), { day: "2-digit", month: "2-digit" });
};
</script>

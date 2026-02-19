<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4 flex flex-col min-h-52">
    <div class="flex items-center justify-between gap-2 mb-4 shrink-0">
      <p class="text-[11px] font-medium text-brand-accent uppercase tracking-wider">
        {{ $t('dashboardWidgets.listaEspera') }}
      </p>
      <div class="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center text-base shrink-0">
        ⏳
      </div>
    </div>
    <div v-if="data.length === 0" class="flex-1 flex items-center justify-center text-sm text-app-text/60">
      {{ $t('dashboardWidgets.noData') }}
    </div>
    <ul v-else class="flex-1 flex flex-col gap-2 overflow-hidden">
      <li
        v-for="item in data"
        :key="item.id"
        class="flex items-center gap-3 p-2 rounded-lg bg-app-surface border border-app-border-subtle"
      >
        <div class="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
          <span class="text-xs font-bold text-amber-600">{{ initials(item.clientName) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-app-title truncate">{{ item.clientName }}</p>
          <p class="text-[10px] text-app-text/60 truncate">{{ item.serviceName }}</p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-[10px] font-medium text-amber-600">{{ preferredDay(item.preferredStart) }}</p>
          <p class="text-[9px] text-app-text/50">{{ waitingSince(item.createdAt) }}</p>
        </div>
      </li>
    </ul>
    <p v-if="data.length > 0" class="mt-2 text-[10px] text-app-text/50 shrink-0">
      {{ data.length }} waiting
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ListaEsperaItem } from "@/interfaces/dashboardStats";

defineProps<{ data: ListaEsperaItem[] }>();

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const preferredDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const waitingSince = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days}d ago`;
};
</script>

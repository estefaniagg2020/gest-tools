<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <div class="flex items-start justify-between gap-2 mb-2">
      <p class="text-[11px] font-medium uppercase tracking-wider"
        :class="data.length > 0 ? 'text-amber-500' : 'text-brand-accent'">
        {{ $t('dashboardWidgets.productosBajoStock') }}
      </p>
      <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
        :class="data.length > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'">
        {{ data.length > 0 ? '⚠️' : '✅' }}
      </div>
    </div>
    <div v-if="data.length === 0" class="text-sm text-app-text/60">{{ $t('dashboardWidgets.allOk') }}</div>
    <div v-else class="space-y-2.5">
      <div v-for="item in data" :key="item.id" class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="text-xs text-app-title truncate flex-1 min-w-0" :title="item.name">{{ item.name }}</span>
          <div class="flex items-center gap-0.5 shrink-0">
            <span class="text-xs font-bold tabular-nums"
              :class="item.stock <= 0 ? 'text-red-500' : 'text-amber-500'">{{ item.stock }}</span>
            <span class="text-[10px] text-app-text/40">/ {{ item.minStock }}</span>
          </div>
        </div>
        <div class="h-1.5 rounded-full bg-app-border-subtle overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500"
            :class="item.stock <= 0 ? 'bg-red-400' : 'bg-amber-400'"
            :style="{ width: Math.max(5, Math.min(100, (item.stock / item.minStock) * 100)) + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductoBajoStockItem } from "@/interfaces/dashboardStats";

defineProps<{ data: ProductoBajoStockItem[] }>();
</script>

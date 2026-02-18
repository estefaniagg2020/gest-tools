<template>
  <div class="rounded-xl bg-app-bg/60 border border-app-border-subtle p-4">
    <p class="text-[11px] font-medium uppercase tracking-wider" :class="data.length > 0 ? 'text-amber-500' : 'text-brand-accent'">
      Productos bajo stock
    </p>
    <div v-if="data.length === 0" class="mt-1 text-sm text-app-text/60">Todo en orden</div>
    <div v-else class="mt-2 space-y-2">
      <div
        v-for="item in data"
        :key="item.id"
        class="flex items-center gap-2"
      >
        <span class="text-sm text-app-title truncate min-w-0 flex-1" :title="item.name">{{ item.name }}</span>
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-sm font-semibold tabular-nums" :class="item.stock <= 0 ? 'text-red-500' : 'text-amber-500'">{{ item.stock }}</span>
          <span class="text-[10px] text-app-text/50">/ {{ item.minStock }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductoBajoStockItem } from "@/interfaces/dashboardStats";

defineProps<{
  data: ProductoBajoStockItem[];
}>();
</script>

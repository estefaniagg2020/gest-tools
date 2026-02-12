<template>
  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
    <h3 class="text-lg font-bold text-gray-800 mb-4 shrink-0">Actividad Reciente</h3>

    <div class="space-y-6 relative overflow-y-auto px-2 -mx-2 flex-1">
      <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>

      <div
        v-for="(item, i) in activities"
        :key="i"
        class="flex gap-4 relative pl-2"
      >
        <div
          class="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0 z-10"
          :class="item.dotClass"
        ></div>
        <div>
          <p class="text-sm font-medium text-gray-800">{{ item.title }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ item.time }}</p>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100 shrink-0">
      <div class="bg-gray-50 rounded-xl p-3">
        <h4 class="text-xs font-bold text-gray-800 mb-1">💡 Tip del día</h4>
        <p class="text-[11px] text-gray-500 leading-relaxed">
          {{ tip }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ActivityItem } from "@/interfaces/components";

  defineProps<{
    activities: ActivityItem[];
    tip: string;
  }>();
</script>

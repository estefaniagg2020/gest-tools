<template>
  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h3 class="text-lg font-bold text-gray-800">Ingresos Semanales</h3>
      <select class="text-sm border-gray-200 rounded-lg text-gray-500 bg-gray-50 px-2 py-1">
        <option>Esta Semana</option>
        <option>Mes Pasado</option>
      </select>
    </div>

    <div class="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
      <div
        v-for="(day, index) in data"
        :key="index"
        class="flex flex-col items-center gap-2 group w-full h-full justify-end"
      >
        <div
          class="w-full max-w-[40px] bg-spa-teal/20 rounded-t-lg relative group-hover:bg-spa-teal transition-colors duration-500"
          :style="{ height: day.percent + '%' }"
        >
          <div
            class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity z-10"
          >
            {{ day.value }}€
          </div>
        </div>
        <span class="text-xs text-gray-400 font-medium">{{ day.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ChartItem } from "@/interfaces/components";

  defineProps<{
    data: ChartItem[];
  }>();
</script>

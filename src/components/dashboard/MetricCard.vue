<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
  >
    <div>
      <p class="text-sm font-medium text-gray-500 mb-1">{{ title }}</p>
      <h3 class="text-2xl font-bold text-gray-800">{{ value }}</h3>
      <p
        v-if="trend"
        class="text-xs font-medium mt-2 flex items-center gap-1"
        :class="trend > 0 ? 'text-green-500' : 'text-red-500'"
      >
        <span>{{ trend > 0 ? "↑" : "↓" }} {{ Math.abs(trend) }}%</span>
        <span class="text-gray-400 font-normal">vs mes pasado</span>
      </p>
    </div>
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      :class="iconBgClass"
    >
      {{ icon }}
    </div>

    <div
      class="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform"
      :class="decoratorClass"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import type { MetricCardProps } from "@/interfaces/components";

  defineProps<MetricCardProps>();
</script>

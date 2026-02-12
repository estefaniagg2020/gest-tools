<template>
  <div
    class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
  >
    <div class="flex items-center gap-2">
      <button
        @click="$emit('today')"
        class="px-3 py-1.5 text-sm font-medium text-spa-teal bg-spa-teal/10 rounded-lg hover:bg-spa-teal/20 transition-colors"
      >
        Hoy
      </button>
      <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200">
        <button
          @click="$emit('prev')"
          class="p-1.5 hover:bg-gray-200 rounded-l-lg text-gray-500"
        >
          &lt;
        </button>
        <button
          @click="$emit('next')"
          class="p-1.5 hover:bg-gray-200 rounded-r-lg text-gray-500"
        >
          &gt;
        </button>
      </div>
      <span class="text-gray-700 font-semibold capitalize ml-2 min-w-[150px]">
        {{ formattedDate }}
      </span>
    </div>

    <div class="flex items-center bg-gray-100 p-1 rounded-lg">
      <button
        v-for="option in viewOptions"
        :key="option.value"
        @click="$emit('changeView', option.value)"
        class="px-3 py-1 text-sm font-medium rounded-md transition-all"
        :class="currentView === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { ViewOption } from "@/interfaces";

  const props = defineProps<{
    currentDate: Date;
    currentView: string;
  }>();

  defineEmits(["prev", "next", "today", "changeView"]);

  const viewOptions: ViewOption[] = [
    { value: "day", label: "Día" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
  ];

  const formattedDate = computed(() => {
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
      day: props.currentView === "day" ? "numeric" : undefined,
    }).format(props.currentDate);
  });
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-4 bg-transparent p-0"
  >
    <div class="flex items-center gap-2">
      <button
        @click="$emit('today')"
        class="px-3 py-1.5 text-sm font-medium text-spa-primary bg-spa-primary/10 rounded-lg hover:bg-spa-primary/20 transition-colors"
      >
        Hoy
      </button>
      <div class="flex items-center bg-app-bg rounded-lg border border-app-border">
        <button
          @click="$emit('prev')"
          class="p-1.5 hover:bg-app-border-subtle rounded-l-lg text-app-text"
        >
          &lt;
        </button>
        <button
          @click="$emit('next')"
          class="p-1.5 hover:bg-app-border-subtle rounded-r-lg text-app-text"
        >
          &gt;
        </button>
      </div>
      <span class="text-app-title font-semibold capitalize ml-2 min-w-[150px]">
        {{ formattedDate }}
      </span>
    </div>

    <div class="flex items-center bg-app-bg p-1 rounded-lg border border-app-border">
      <button
        v-for="option in viewOptions"
        :key="option.value"
        @click="$emit('changeView', option.value)"
        class="px-3 py-1 text-sm font-medium rounded-md transition-all"
        :class="currentView === option.value ? 'bg-app-surface text-app-title shadow-sm' : 'text-app-text/80 hover:text-app-title'"
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

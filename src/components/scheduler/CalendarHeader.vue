<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-transparent p-0"
  >
    <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
      <button
        @click="$emit('today')"
        class="shrink-0 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors"
      >
        {{ t("scheduler.today") }}
      </button>
      <div class="flex items-center bg-app-bg rounded-lg border border-app-border shrink-0">
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
      <span class="text-app-title font-semibold capitalize ml-1 sm:ml-2 min-w-0 truncate text-sm sm:text-base" :title="formattedDate">
        {{ formattedDate }}
      </span>
    </div>

    <div class="flex items-center bg-app-bg p-1 rounded-lg border border-app-border shrink-0">
      <button
        v-for="option in viewOptions"
        :key="option.value"
        @click="$emit('changeView', option.value)"
        class="px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all"
        :class="currentView === option.value ? 'bg-app-surface text-app-title shadow-sm' : 'text-app-text/80 hover:text-app-title'"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { getIntlLocale } from "@/utils/intlLocale";
  import type { ViewOption } from "@/interfaces";

  const props = defineProps<{
    currentDate: Date;
    currentView: string;
  }>();

  defineEmits(["prev", "next", "today", "changeView"]);

  const { t } = useI18n();

  const viewOptions = computed<ViewOption[]>(() => [
    { value: "day", label: t("configAgenda.viewDay") },
    { value: "week", label: t("configAgenda.viewWeek") },
    { value: "month", label: t("configAgenda.viewMonth") },
  ]);

  const formattedDate = computed(() => {
    return new Intl.DateTimeFormat(getIntlLocale(), {
      month: "long",
      year: "numeric",
      day: props.currentView === "day" ? "numeric" : undefined,
    }).format(props.currentDate);
  });
</script>

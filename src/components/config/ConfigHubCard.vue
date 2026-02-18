<template>
  <RouterLink
    :to="to"
    class="block rounded-2xl border bg-app-surface p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[accentBorderClass, accentRingClass]"
  >
    <div
      class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
      :class="accentBgClass"
    >
      {{ icon }}
    </div>
    <h3 class="font-semibold text-app-title transition-colors duration-200">
      {{ title }}
    </h3>
    <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
      {{ description }}
    </p>
    <span
      class="mt-4 inline-flex items-center gap-1 text-sm font-medium"
      :class="accentTextClass"
    >
      {{ actionLabelText }}
      <span aria-hidden="true">→</span>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import type { ConfigHubCardProps } from "@/interfaces/components";

  const { t } = useI18n();
  const props = defineProps<ConfigHubCardProps>();
  const actionLabelText = computed(() => props.actionLabel ?? t("common.configure"));

  const accentMap = computed(() => {
    const map = {
      teal: {
        border: "border-teal-100 hover:border-teal-200",
        ring: "focus:ring-teal-500",
        bg: "bg-teal-50 text-teal-600",
        text: "text-teal-600",
      },
      violet: {
        border: "border-violet-100 hover:border-violet-200",
        ring: "focus:ring-violet-500",
        bg: "bg-violet-50 text-violet-600",
        text: "text-violet-600",
      },
      amber: {
        border: "border-amber-100 hover:border-amber-200",
        ring: "focus:ring-amber-500",
        bg: "bg-amber-50 text-amber-600",
        text: "text-amber-600",
      },
      sky: {
        border: "border-sky-100 hover:border-sky-200",
        ring: "focus:ring-sky-500",
        bg: "bg-sky-50 text-sky-600",
        text: "text-sky-600",
      },
      rose: {
        border: "border-rose-100 hover:border-rose-200",
        ring: "focus:ring-rose-500",
        bg: "bg-rose-50 text-rose-600",
        text: "text-rose-600",
      },
    };
    return map[props.accent];
  });

  const accentBorderClass = computed(() => accentMap.value.border);
  const accentRingClass = computed(() => accentMap.value.ring);
  const accentBgClass = computed(() => accentMap.value.bg);
  const accentTextClass = computed(() => accentMap.value.text);
</script>

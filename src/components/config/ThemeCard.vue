<template>
  <button
    type="button"
    class="flex w-full flex-col rounded-2xl border-2 bg-app-surface p-5 text-left transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spa-teal"
    :class="[
      isSelected
        ? 'border-spa-teal bg-spa-teal/10 ring-2 ring-spa-teal/30'
        : 'border-spa-teal/20 hover:border-spa-teal/40',
    ]"
    @click="$emit('select')"
  >
    <div
      class="mb-3 flex h-14 w-full rounded-xl border border-spa-teal/10"
      :class="previewClass"
      :style="previewStyle"
      aria-hidden="true"
    />
    <h3 class="font-semibold text-app-title transition-colors duration-200">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-0.5 text-sm text-app-text/70 transition-colors duration-200"
    >
      {{ description }}
    </p>
  </button>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = defineProps<{
    themeId: string;
    title: string;
    description?: string;
    isSelected: boolean;
    previewColor?: string;
    previewColors?: string[];
  }>();

  defineEmits<{ (e: "select"): void }>();

  const previewClass = computed(() => {
    if (props.previewColor) return "";
    if (props.previewColors && props.previewColors.length >= 5) return "";
    const map: Record<string, string> = {
      teal: "bg-[#017074]",
      claro: "bg-gradient-to-br from-gray-100 to-gray-50",
      oscuro: "bg-gradient-to-br from-gray-800 to-gray-900",
      oceano: "bg-gradient-to-br from-sky-400 to-blue-600",
      bosque: "bg-gradient-to-br from-green-500 to-emerald-700",
      atardecer: "bg-gradient-to-br from-orange-400 to-amber-600",
      lavanda: "bg-gradient-to-br from-violet-400 to-purple-600",
      coral: "bg-gradient-to-br from-rose-400 to-red-600",
      indigo: "bg-gradient-to-br from-indigo-400 to-indigo-700",
      rosa: "bg-gradient-to-br from-pink-400 to-rose-500",
      minimal: "bg-gray-50",
      arena: "bg-gradient-to-br from-amber-100 to-yellow-200",
      esmeralda: "bg-gradient-to-br from-emerald-500 to-teal-600",
    };
    return map[props.themeId] ?? "bg-gray-100";
  });

  const previewStyle = computed(() => {
    if (props.previewColor) return { background: props.previewColor };
    const colors = props.previewColors;
    if (!colors || colors.length < 5) return undefined;
    return {
      background: `linear-gradient(to right, ${colors.slice(0, 6).join(", ")})`,
    };
  });
</script>

<template>
  <button
    type="button"
    class="flex w-full flex-col rounded-xl border p-3 text-left transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-accent"
    :class="[
      isSelected
        ? 'border-brand-accent bg-brand-accent/15'
        : 'border-gray-200 bg-brand-accent/5 hover:border-brand-accent/40 hover:bg-brand-accent/10',
    ]"
    @click="$emit('select')"
  >
    <div
      class="mb-2 flex h-8 w-full rounded-lg border border-gray-200"
      :class="previewClass"
      :style="previewStyle"
      aria-hidden="true"
    />
    <h3 class="text-sm font-semibold text-app-title transition-colors duration-200">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-0.5 text-xs text-app-text/70 transition-colors duration-200 line-clamp-2"
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
      amarillo: "bg-gradient-to-br from-amber-200 to-yellow-300",
      verde: "bg-gradient-to-br from-green-300 to-emerald-400",
      azul: "bg-gradient-to-br from-sky-300 to-blue-400",
      "azul-oscuro": "bg-gradient-to-br from-slate-800 to-blue-900",
      rojo: "bg-gradient-to-br from-red-300 to-rose-400",
      rosa: "bg-gradient-to-br from-pink-400 to-rose-500",
      teal: "bg-[#017074]",
      claro: "bg-gradient-to-br from-gray-100 to-gray-50",
      oscuro: "bg-gradient-to-br from-gray-800 to-gray-900",
      oceano: "bg-gradient-to-br from-sky-400 to-blue-600",
      bosque: "bg-gradient-to-br from-green-500 to-emerald-700",
      atardecer: "bg-gradient-to-br from-orange-400 to-amber-600",
      lavanda: "bg-gradient-to-br from-violet-400 to-purple-600",
      coral: "bg-gradient-to-br from-rose-400 to-red-600",
      indigo: "bg-gradient-to-br from-indigo-400 to-indigo-700",
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

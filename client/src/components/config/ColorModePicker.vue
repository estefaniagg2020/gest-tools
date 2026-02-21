<template>
  <section class="mt-6">
    <h2 class="text-sm font-semibold text-app-title mb-2">Apariencia</h2>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
        :class="modelValue === opt.value
          ? 'border-brand-accent bg-brand-accent/15 text-brand-accent'
          : 'border-app-border-subtle bg-app-bg/80 text-app-text/80 hover:border-brand-accent/40 hover:text-app-title'"
        @click="$emit('update:modelValue', opt.value)"
      >
        <span aria-hidden="true">{{ opt.icon }}</span>
        {{ opt.label }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
  export type ColorModeOption = { value: "light" | "dark" | "mixed" | "system"; label: string; icon: string };

  defineProps<{
    modelValue: "light" | "dark" | "mixed" | "system";
    options: ColorModeOption[];
  }>();

  defineEmits<{
    "update:modelValue": [value: "light" | "dark" | "mixed" | "system"];
  }>();
</script>

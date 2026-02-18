<template>
  <button
    type="button"
    class="flex w-full flex-col rounded-2xl border-2 bg-app-surface p-4 text-left transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
    :class="[
      isSelected
        ? 'border-brand-accent bg-brand-accent/10 ring-2 ring-brand-accent/30'
        : 'border-brand-accent/20 hover:border-brand-accent/40',
    ]"
    @click="$emit('select')"
  >
    <span
      v-if="icon"
      class="mb-2 text-2xl"
      aria-hidden="true"
    >{{ icon }}</span>
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
  defineProps<{
    title: string;
    description?: string;
    icon?: string;
    isSelected: boolean;
  }>();

  defineEmits<{ (e: "select"): void }>();
</script>

<template>
  <div class="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
    <ThemeCard
      v-for="option in options"
      :key="option.id"
      :theme-id="option.id"
      :title="option.label"
      :description="option.description"
      :is-selected="selectedId === option.id"
      :preview-color="option.id === 'personalizado' ? primaryColorForCustom : undefined"
      @select="$emit('select', option.id)"
    />
  </div>
</template>

<script setup lang="ts">
  import ThemeCard from "./ThemeCard.vue";

  export interface ThemeGridOption {
    id: string;
    label: string;
    description?: string;
  }

  defineProps<{
    options: readonly ThemeGridOption[];
    selectedId: string;
    primaryColorForCustom?: string;
  }>();

  defineEmits<{
    select: [id: string];
  }>();
</script>

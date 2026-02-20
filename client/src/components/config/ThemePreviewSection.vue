<template>
  <section class="mt-6">
    <h2 class="text-sm font-semibold text-app-title mb-1">Vista previa</h2>
    <p class="text-xs text-app-text/70 mb-2">
      Así se verá tu agenda con los tonos elegidos.
    </p>
    <div :key="previewKey" class="max-w-sm">
      <ThemeAgendaPreview
        :primary-color="primaryColor"
        :secondary-color="secondaryColor"
        :bg-color="bgColor"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import ThemeAgendaPreview from "./ThemeAgendaPreview.vue";

  defineProps<{
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    previewKey?: number;
  }>();
</script>

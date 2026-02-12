<template>
  <div class="flex flex-col gap-4 mb-4 sm:mb-6 sm:flex-row sm:justify-between sm:items-center">
    <div class="min-w-0">
      <h2 class="text-xl font-bold text-gray-800 sm:text-2xl">{{ THERAPIST_MANAGER.PAGE_TITLE }}</h2>
      <p class="text-sm text-gray-500 sm:text-base">{{ THERAPIST_MANAGER.PAGE_SUBTITLE }}</p>
    </div>
    <BaseButton
      class="w-full shrink-0 sm:w-auto"
      @click="$emit('create')"
    >
      <template #icon><span>+</span></template>
      {{ THERAPIST_MANAGER.BTN_NEW }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from "@/components/common/BaseButton.vue";
  import { THERAPIST_MANAGER } from "@/data/constants";

  defineEmits<{ create: [] }>();
</script>

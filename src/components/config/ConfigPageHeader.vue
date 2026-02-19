<template>
  <header>
    <BackLink
      v-if="backTo"
      :to="backTo"
      :label="backLabel ?? ''"
    />
    <h1 class="text-2xl font-bold tracking-tight text-app-title transition-colors duration-200">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="mt-1 text-sm text-app-text/70 transition-colors duration-200"
    >
      {{ description }}
    </p>
  </header>
</template>

<script setup lang="ts">
  import type { RouteLocationRaw } from "vue-router";
  import BackLink from "@/components/common/BackLink.vue";

  defineProps<{
    title: string;
    description?: string;
    backTo?: RouteLocationRaw;
    backLabel?: string;
  }>();
</script>

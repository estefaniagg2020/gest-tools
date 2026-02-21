<template>
  <RouterLink
    :to="to"
    class="mb-6 inline-flex"
  >
    <BaseButton variant="outline">
      ← {{ label }}
    </BaseButton>
  </RouterLink>
</template>

<script setup lang="ts">
  import type { RouteLocationRaw } from "vue-router";
  import BaseButton from "@/components/common/BaseButton.vue";

  defineProps<{
    to: RouteLocationRaw;
    label: string;
  }>();
</script>

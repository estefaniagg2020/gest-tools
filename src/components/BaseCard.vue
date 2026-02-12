<template>
  <div :class="['rounded-3xl bg-spa-peach/70 p-6 shadow-sm', cardClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
  type Props = {
    cardClass?: string;
  };

  defineProps<Props>();
</script>

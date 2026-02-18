<template>
  <button
    type="button"
    class="rounded-lg border border-brand-accent/40 bg-brand-accent/15 px-4 py-2 text-sm font-medium text-brand-accent transition-colors duration-200 hover:bg-brand-accent/25"
    @click="$emit('click')"
  >
    Valores por defecto
  </button>
</template>

<script setup lang="ts">
  defineEmits<{
    click: [];
  }>();
</script>

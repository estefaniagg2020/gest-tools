<template>
  <Teleport to="body">
    <div
      v-if="scheduleDrag.moving.value"
      class="drag-ghost"
      :style="ghostStyle"
    >
      <span class="drag-ghost-label">{{ scheduleDrag.label.value }}</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useScheduleDrag } from "@/composables/useScheduleDrag";

  const scheduleDrag = useScheduleDrag();

  const ghostStyle = computed(() => ({
    left: `${scheduleDrag.ghostX.value + 14}px`,
    top: `${scheduleDrag.ghostY.value - 16}px`,
  }));
</script>

<style scoped>
  .drag-ghost {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    max-width: 180px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--color-app-surface, #fff);
    border-left: 4px solid var(--color-brand-primary, #6366f1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.10);
    transform: rotate(2deg);
    transition: none;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-app-title, #111);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.95;
  }

  .drag-ghost-label {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

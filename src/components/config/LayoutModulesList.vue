<template>
  <ul class="space-y-2">
    <li
      v-for="module in orderedModules"
      :key="module.id"
      class="flex items-center gap-3 rounded-xl border-2 bg-app-surface p-3 transition-all duration-200"
      :class="[
        dragOverId === module.id ? 'border-spa-teal bg-spa-teal/10' : 'border-transparent hover:border-spa-teal/30',
        isDraggingId === module.id ? 'opacity-50 scale-[0.98]' : '',
      ]"
      draggable="true"
      @dragstart="handleDragStart($event, module.id)"
      @dragend="handleDragEnd"
      @dragover.prevent="handleDragOver($event, module.id)"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop(module.id)"
    >
      <span
        class="cursor-grab touch-none text-app-text/50 text-lg active:cursor-grabbing"
        aria-hidden="true"
      >⋮⋮</span>
      <span class="text-2xl">{{ module.icon }}</span>
      <span class="font-medium text-app-text">{{ module.label }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import type { LayoutModule } from "@/data/layoutModules";

  defineProps<{
    orderedModules: LayoutModule[];
  }>();

  const emit = defineEmits<{
    (e: "reorder", draggedId: string, targetId: string): void;
  }>();

  const isDraggingId = ref<string | null>(null);
  const dragOverId = ref<string | null>(null);

  const handleDragStart = (event: DragEvent, id: string) => {
    if (!event.dataTransfer) return;
    isDraggingId.value = id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.setData("application/json", JSON.stringify({ id }));
  };

  const handleDragEnd = () => {
    isDraggingId.value = null;
    dragOverId.value = null;
  };

  const handleDragOver = (_event: DragEvent, id: string) => {
    if (isDraggingId.value === id) return;
    dragOverId.value = id;
  };

  const handleDragLeave = () => {
    dragOverId.value = null;
  };

  const handleDrop = (targetId: string) => {
    dragOverId.value = null;
    const draggedId = isDraggingId.value;
    if (draggedId && draggedId !== targetId) emit("reorder", draggedId, targetId);
  };
</script>

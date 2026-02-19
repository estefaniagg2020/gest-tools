<template>
  <div class="min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)] transition-colors duration-200">
    <RouterView />
    <ToastContainer />
    <DragGhost />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
  import ToastContainer from "@/components/common/ToastContainer.vue";
  import DragGhost from "@/components/scheduler/DragGhost.vue";
  import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
</script>

<template>
  <div class="min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)] transition-colors duration-200">
    <RouterView />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
  import ToastContainer from "@/components/common/ToastContainer.vue";
</script>

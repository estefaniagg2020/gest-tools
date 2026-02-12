<template>
  <div class="min-h-screen bg-spa-white text-spa-teal">
    <RouterView />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
  import ToastContainer from "@/components/common/ToastContainer.vue";
</script>

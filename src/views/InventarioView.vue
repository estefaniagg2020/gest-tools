<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <h1 class="text-xl font-semibold text-app-title">Inventario</h1>
      <p class="mt-2 text-sm text-app-text/70">
        Stock y productos. Próximamente.
      </p>
      <RouterLink
        :to="{ name: 'dashboard' }"
        class="mt-4 inline-block text-sm font-medium text-spa-teal hover:underline"
      >
        Volver al panel de control
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { RouterLink } from "vue-router";
</script>

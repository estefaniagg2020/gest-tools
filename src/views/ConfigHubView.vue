<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="mb-10">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Configuración
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Elige qué quieres configurar. Puedes volver aquí cuando quieras.
        </p>
      </header>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ConfigHubCard
          v-for="card in hub.cards"
          :key="card.id"
          :to="card.to"
          :title="card.title"
          :description="card.description"
          :icon="card.icon"
          :accent="card.accent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useConfigHub } from "@/composables/useConfigHub";
  import ConfigHubCard from "@/components/config/ConfigHubCard.vue";

  const hub = useConfigHub();
</script>

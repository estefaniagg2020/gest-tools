<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="mb-10">
        <h1 class="text-2xl font-bold tracking-tight text-app-title sm:text-3xl transition-colors duration-200">
          Configuración
        </h1>
        <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
          Elige qué quieres configurar. Cuando termines, pulsa «He finalizado» para ir al panel de control.
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

      <div class="mt-12 pt-8 border-t border-gray-200">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-spa-teal text-white shadow-sm hover:bg-spa-teal/90 transition-colors focus:outline-none focus:ring-2 focus:ring-spa-teal focus:ring-offset-2"
          @click="onHeFinalizado"
        >
          He finalizado
          <span aria-hidden="true">→</span>
        </RouterLink>
        <p class="mt-2 text-sm text-app-text/60">
          Irás al panel de control con todo lo configurado. Podrás volver a Configuración cuando quieras.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useConfigHub } from "@/composables/useConfigHub";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import ConfigHubCard from "@/components/config/ConfigHubCard.vue";

  const hub = useConfigHub();
  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();

  const onHeFinalizado = () => {
    const userId = authStore.user?.id;
    if (userId) {
      gestorConfigStore.markOnboardingComplete(userId);
    }
  };
</script>

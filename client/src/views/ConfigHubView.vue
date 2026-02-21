<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-app-title sm:text-3xl transition-colors duration-200">
            {{ $t('config.title') }}
          </h1>
          <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
            {{ $t('config.subtitle') }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-accent text-white shadow-md shadow-brand-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
          @click="onHeFinalizado"
        >
          {{ $t('config.goToDashboard') }}
          <span aria-hidden="true">→</span>
        </RouterLink>
      </header>

      <div class="mb-6">
        <ConfigBusinessSummaryPanel />
      </div>

      <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <ConfigHubCard
          v-for="card in configCards"
          :key="card.id"
          :to="card.to"
          :title="$t(card.titleKey)"
          :description="$t(card.descriptionKey)"
          :icon="card.icon"
          :accent="card.accent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useConfigHub } from "@/composables/useConfigHub";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import ConfigHubCard from "@/components/config/ConfigHubCard.vue";
  import ConfigBusinessSummaryPanel from "@/components/config/ConfigBusinessSummaryPanel.vue";

  const { cards: configCards } = useConfigHub();
  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();

  const onHeFinalizado = () => {
    const userId = authStore.user?.id;
    const businessId = authStore.user?.businessId ?? null;
    if (userId) {
      gestorConfigStore.markOnboardingComplete(userId, businessId);
    }
  };
</script>

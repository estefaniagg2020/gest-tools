<template>
  <div class="h-full flex flex-col p-5 overflow-hidden">
    <DashboardHeader :current-date="currentDate" />

    <div class="flex-1 flex items-center justify-center min-h-0">
      <div class="text-center text-gray-500">
        <p class="text-sm">Configura tu gestor desde <strong class="text-gray-700">Inicio</strong>.</p>
        <RouterLink
          to="/"
          class="inline-block mt-3 text-sm font-medium text-spa-teal hover:underline"
        >
          Ir a Inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { RouterLink } from "vue-router";
  import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";

  const currentDate = computed(() => new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }));
</script>

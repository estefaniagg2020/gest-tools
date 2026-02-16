<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <RouterLink
        to="/config"
        class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-app-text/70 hover:text-spa-teal transition-colors duration-200"
      >
        ← Volver a configuración
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-app-title transition-colors duration-200">
        Iconos del menú
      </h1>
      <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
        Elige el icono que quieres ver en el menú lateral y en el panel de control para cada sección.
      </p>

      <section
        v-for="category in categories"
        :key="category"
        class="mt-10"
      >
        <h2 class="text-lg font-semibold text-app-title mb-3">
          {{ MODULE_ICON_CATEGORY_LABELS[category] }}
        </h2>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="opt in MODULE_ICON_OPTIONS[category]"
            :key="opt.value"
            type="button"
            class="flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spa-teal"
            :class="selectedIcon(category) === opt.value
              ? 'border-spa-teal bg-spa-teal/10 ring-2 ring-spa-teal/30'
              : 'border-gray-200 bg-app-surface hover:border-gray-300 hover:bg-gray-50'"
            :title="opt.label"
            @click="onSelectIcon(category, opt.value)"
          >
            {{ opt.value }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import type { ModuleIconCategory } from "@/interfaces/moduleIcons";
  import { MODULE_ICON_CATEGORY_LABELS, MODULE_ICON_OPTIONS } from "@/data/moduleIconOptions";
  import { useModuleIconsStore } from "@/stores/moduleIcons";
  import { useAuthStore } from "@/stores/auth";
  import { storeToRefs } from "pinia";

  const categories: ModuleIconCategory[] = [
    "calendarios",
    "personas",
    "servicios",
    "inventario",
    "clientes",
  ];

  const authStore = useAuthStore();
  const moduleIconsStore = useModuleIconsStore();
  const { calendarios, personas, servicios, inventario, clientes } = storeToRefs(moduleIconsStore);

  const selectedIcon = (category: ModuleIconCategory): string => {
    switch (category) {
      case "calendarios":
        return calendarios.value;
      case "personas":
        return personas.value;
      case "servicios":
        return servicios.value;
      case "inventario":
        return inventario.value;
      case "clientes":
        return clientes.value;
      default:
        return "";
    }
  };

  const onSelectIcon = (category: ModuleIconCategory, icon: string) => {
    moduleIconsStore.setIcon(category, icon);
  };

  onMounted(() => {
    const userId = authStore.user?.id;
    if (userId) {
      moduleIconsStore.initialize(userId);
    }
  });
</script>

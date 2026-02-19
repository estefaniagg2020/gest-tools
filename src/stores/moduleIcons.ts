import { defineStore } from "pinia";
import { computed } from "vue";
import type { ModuleIconCategory, ModuleIconsConfig } from "@/interfaces/moduleIcons";
import { DEFAULT_MODULE_ICONS } from "@/data/moduleIconOptions";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useAuthStore } from "@/stores/auth";

export const useModuleIconsStore = defineStore("moduleIcons", () => {
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();

  const config = computed<ModuleIconsConfig>(() =>
    configStore.moduleIcons
      ? { ...DEFAULT_MODULE_ICONS, ...configStore.moduleIcons }
      : { ...DEFAULT_MODULE_ICONS },
  );

  const calendarios = computed(() => config.value.calendarios);
  const personas = computed(() => config.value.personas);
  const servicios = computed(() => config.value.servicios);
  const inventario = computed(() => config.value.inventario);
  const clientes = computed(() => config.value.clientes);

  // initialize is a no-op — gestorConfigStore.initialize() loads everything from API
  const initialize = (_userId: string) => {};

  const setIcon = async (category: ModuleIconCategory, icon: string) => {
    const next = { ...config.value, [category]: icon };
    const currentConfig = configStore.getConfig();
    await configStore.setConfig(
      authStore.user?.id || authStore.currentUserId || "default",
      { ...currentConfig, moduleIcons: next },
      authStore.user?.businessId,
    );
  };

  const getIcon = (category: ModuleIconCategory): string =>
    config.value[category] ?? "";

  return {
    calendarios,
    personas,
    servicios,
    inventario,
    clientes,
    config,
    initialize,
    setIcon,
    getIcon,
  };
});

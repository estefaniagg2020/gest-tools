import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ModuleIconCategory, ModuleIconsConfig } from "@/interfaces/moduleIcons";
import { DEFAULT_MODULE_ICONS } from "@/data/moduleIconOptions";
import * as moduleIconsStorage from "@/infrastructure/moduleIconsStorage";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

export const useModuleIconsStore = defineStore("moduleIcons", () => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  const calendarios = ref<string>(DEFAULT_MODULE_ICONS.calendarios);
  const personas = ref<string>(DEFAULT_MODULE_ICONS.personas);
  const servicios = ref<string>(DEFAULT_MODULE_ICONS.servicios);
  const inventario = ref<string>(DEFAULT_MODULE_ICONS.inventario);
  const clientes = ref<string>(DEFAULT_MODULE_ICONS.clientes);

  const config = computed<ModuleIconsConfig>(() => ({
    calendarios: calendarios.value,
    personas: personas.value,
    servicios: servicios.value,
    inventario: inventario.value,
    clientes: clientes.value,
  }));

  const initialize = (userId: string) => {
    const stored = moduleIconsStorage.loadModuleIcons(userId);
    if (stored) {
      calendarios.value = stored.calendarios;
      personas.value = stored.personas;
      servicios.value = stored.servicios;
      inventario.value = stored.inventario;
      clientes.value = stored.clientes;
    } else {
      calendarios.value = DEFAULT_MODULE_ICONS.calendarios;
      personas.value = DEFAULT_MODULE_ICONS.personas;
      servicios.value = DEFAULT_MODULE_ICONS.servicios;
      inventario.value = DEFAULT_MODULE_ICONS.inventario;
      clientes.value = DEFAULT_MODULE_ICONS.clientes;
    }
  };

  const setIcon = (category: ModuleIconCategory, icon: string) => {
    switch (category) {
      case "calendarios":
        calendarios.value = icon;
        break;
      case "personas":
        personas.value = icon;
        break;
      case "servicios":
        servicios.value = icon;
        break;
      case "inventario":
        inventario.value = icon;
        break;
      case "clientes":
        clientes.value = icon;
        break;
    }
    persist();
  };

  const getIcon = (category: ModuleIconCategory): string => {
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

  const persist = () => {
    const uid = user.value?.id;
    if (!uid) return;
    moduleIconsStorage.saveModuleIcons(uid, config.value);
  };

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

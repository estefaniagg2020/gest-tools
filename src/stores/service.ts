import { defineStore } from "pinia";
import { ref } from "vue";
import type { Service } from "@/interfaces";
import { DEFAULT_SERVICES } from "@/data/services";

export const useServiceStore = defineStore("service", () => {
  const services = ref<Service[]>(DEFAULT_SERVICES);

  const getServiceById = (id: string) => {
    return services.value.find((service) => service.id === id);
  };

  const getServicesByCategory = (category: string) => {
    return services.value.filter((service) => service.category === category);
  };

  return {
    services,
    getServiceById,
    getServicesByCategory,
  };
});

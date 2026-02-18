import { defineStore } from "pinia";
import { ref } from "vue";
import type { Service } from "@/interfaces";
import { loadStoredServices, saveServiceList } from "@/infrastructure/serviceStorage";

export const useServiceStore = defineStore("service", () => {
  const services = ref<Service[]>([]);

  const initialize = () => {
    const stored = loadStoredServices();
    services.value = stored ?? [];
  };

  const getServiceById = (id: string) => {
    return services.value.find((service) => service.id === id);
  };

  const getServicesByCategory = (category: string) => {
    return services.value.filter((service) => service.category === category);
  };

  const addService = (service: Omit<Service, "id">) => {
    const id = `svc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newService: Service = { ...service, id };
    services.value.push(newService);
    saveServiceList(services.value);
    return newService;
  };

  const updateService = (id: string, updates: Partial<Omit<Service, "id">>) => {
    const index = services.value.findIndex((s) => s.id === id);
    if (index === -1) return;
    services.value[index] = { ...services.value[index], ...updates };
    saveServiceList(services.value);
  };

  const deleteService = (id: string) => {
    services.value = services.value.filter((s) => s.id !== id);
    saveServiceList(services.value);
  };

  return {
    services,
    initialize,
    getServiceById,
    getServicesByCategory,
    addService,
    updateService,
    deleteService,
  };
});

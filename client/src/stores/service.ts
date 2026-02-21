import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Service, CatalogCategory } from "@/interfaces";
import { bookingApi } from "@/infrastructure/bookingApi";
import { useAuthStore } from "@/stores/auth";

const catalogServiceToService = (
  svc: CatalogCategory["services"][number],
  cat: CatalogCategory,
): Service => ({
  id: svc.id,
  name: svc.name,
  category: cat.label,
  categoryId: cat.id,
  serviceCategory: { id: cat.id, label: cat.label, icon: cat.icon },
  duration: svc.duration,
  price: svc.price,
  description: svc.description ?? undefined,
});

const mapApiService = (s: {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  serviceCategory?: { id: string; label: string; icon: string };
  duration: number;
  price: number;
  description?: string | null;
}): Service => ({
  id: s.id,
  name: s.name,
  category: s.category,
  categoryId: s.categoryId,
  serviceCategory: s.serviceCategory,
  duration: s.duration,
  price: s.price,
  description: s.description ?? undefined,
});

export const useServiceStore = defineStore("service", () => {
  const catalog = ref<CatalogCategory[]>([]);

  const getBusinessId = () => {
    const authStore = useAuthStore();
    return authStore.user?.businessId ?? null;
  };

  const services = computed<Service[]>(() =>
    catalog.value.flatMap((cat) => cat.services.map((svc) => catalogServiceToService(svc, cat))),
  );

  const initialize = async () => {
    const businessId = getBusinessId();
    if (!businessId) {
      catalog.value = [];
      return;
    }
    try {
      catalog.value = await bookingApi.getCatalog(businessId);
    } catch (e) {
      console.error("Error fetching services from API:", e);
      catalog.value = [];
    }
  };

  const getServiceById = (id: string) => services.value.find((s) => s.id === id);

  const getServicesByCategory = (categoryId: string) =>
    services.value.filter((s) => s.categoryId === categoryId);

  const addService = async (service: Omit<Service, "id">): Promise<Service> => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error("No business ID — cannot create service");
    const created = await bookingApi.createService(businessId, service);
    await initialize();
    return mapApiService(created);
  };

  const updateService = async (id: string, updates: Partial<Omit<Service, "id">>) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error("No business ID — cannot update service");
    await bookingApi.updateService(businessId, id, updates);
    await initialize();
  };

  const deleteService = async (id: string) => {
    const businessId = getBusinessId();
    if (!businessId) return;
    await bookingApi.deleteService(businessId, id);
    await initialize();
  };

  return {
    catalog,
    services,
    initialize,
    getServiceById,
    getServicesByCategory,
    addService,
    updateService,
    deleteService,
  };
});

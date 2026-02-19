import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Service, CatalogCategory } from "@/interfaces";
import { loadStoredServices, saveServiceList } from "@/infrastructure/serviceStorage";
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
  isSystemService: svc.isSystemService,
});

const mapApiService = (s: {
  id: string;
  name: string;
  category: string;
  categoryId?: string | null;
  serviceCategory?: { id: string; label: string; icon: string } | null;
  duration: number;
  price: number;
  description?: string | null;
  isSystemService?: boolean;
}): Service => ({
  id: s.id,
  name: s.name,
  category: s.category,
  categoryId: s.categoryId ?? null,
  serviceCategory: s.serviceCategory ?? null,
  duration: s.duration,
  price: s.price,
  description: s.description ?? undefined,
  isSystemService: s.isSystemService ?? false,
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
    if (businessId) {
      try {
        catalog.value = await bookingApi.getCatalog(businessId);
        return;
      } catch {
        // fall through to local fallback
      }
    }
    const stored = loadStoredServices() ?? [];
    catalog.value = stored.length
      ? [{ id: "local", label: "General", icon: "📋", isSystem: false, services: stored.map((s) => ({ id: s.id, name: s.name, duration: s.duration, price: s.price, description: s.description ?? null, isSystemService: false })) }]
      : [];
  };

  const getServiceById = (id: string) => services.value.find((s) => s.id === id);

  const getServicesByCategory = (categoryId: string) =>
    services.value.filter((s) => s.categoryId === categoryId || s.serviceCategory?.id === categoryId);

  const addService = async (service: Omit<Service, "id">): Promise<Service> => {
    const businessId = getBusinessId();
    if (businessId) {
      try {
        const created = await bookingApi.createService(businessId, service);
        await initialize();
        return mapApiService(created);
      } catch {
        // fall through
      }
    }
    const id = `svc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newService: Service = { ...service, id };
    saveServiceList([...services.value, newService]);
    await initialize();
    return newService;
  };

  const updateService = async (id: string, updates: Partial<Omit<Service, "id">>) => {
    const businessId = getBusinessId();
    if (businessId) {
      try {
        await bookingApi.updateService(businessId, id, updates);
        await initialize();
        return;
      } catch {
        // fall through
      }
    }
    const updated = services.value.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveServiceList(updated);
    await initialize();
  };

  const deleteService = async (id: string) => {
    const businessId = getBusinessId();
    if (businessId) {
      try {
        await bookingApi.deleteService(businessId, id);
      } catch {
        // fall through
      }
    } else {
      saveServiceList(services.value.filter((s) => s.id !== id));
    }
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

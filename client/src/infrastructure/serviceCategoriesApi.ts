import { apiFetch } from "./apiClient";
import type { ServiceCategoryDefinition } from "@/interfaces";

export const serviceCategoriesApi = {
  getCategories: async (): Promise<ServiceCategoryDefinition[]> => {
    const res = await apiFetch("/api/service-categories");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar categorías");
    return Array.isArray(data) ? data : [];
  },

  createCategory: async (payload: { label: string; icon?: string }): Promise<ServiceCategoryDefinition> => {
    const res = await apiFetch("/api/service-categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al crear categoría");
    return data as ServiceCategoryDefinition;
  },

  updateCategory: async (id: string, payload: Partial<{ label: string; icon: string }>): Promise<ServiceCategoryDefinition> => {
    const res = await apiFetch(`/api/service-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar categoría");
    return data as ServiceCategoryDefinition;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/service-categories/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar categoría");
    }
  },
};

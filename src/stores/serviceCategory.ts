import { defineStore } from "pinia";
import { ref } from "vue";
import type { ServiceCategoryDefinition } from "@/interfaces";
import { serviceCategoriesApi } from "@/infrastructure/serviceCategoriesApi";

export const useServiceCategoryStore = defineStore("serviceCategory", () => {
  const categories = ref<ServiceCategoryDefinition[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      categories.value = await serviceCategoriesApi.getCategories();
    } catch {
      categories.value = [];
    }
  };

  const getCategoryById = (id: string) =>
    categories.value.find((c) => c.id === id);

  const addCategory = async (payload: { label: string; icon: string }): Promise<ServiceCategoryDefinition> => {
    const created = await serviceCategoriesApi.createCategory(payload);
    categories.value.push(created);
    return created;
  };

  const addCategoryWithId = async (payload: {
    id: string;
    label: string;
    icon: string;
  }): Promise<ServiceCategoryDefinition> => {
    const existing = categories.value.find((c) => c.id === payload.id);
    if (existing) return existing;
    const created = await serviceCategoriesApi.createCategory({ label: payload.label, icon: payload.icon });
    categories.value.push(created);
    return created;
  };

  const updateCategory = async (
    id: string,
    updates: Partial<Pick<ServiceCategoryDefinition, "label" | "icon">>
  ): Promise<void> => {
    const updated = await serviceCategoriesApi.updateCategory(id, updates);
    const index = categories.value.findIndex((c) => c.id === id);
    if (index !== -1) categories.value[index] = updated;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await serviceCategoriesApi.deleteCategory(id);
    categories.value = categories.value.filter((c) => c.id !== id);
  };

  return {
    categories,
    initialize,
    getCategoryById,
    addCategory,
    addCategoryWithId,
    updateCategory,
    deleteCategory,
  };
});

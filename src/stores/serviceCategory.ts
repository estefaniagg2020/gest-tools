import { defineStore } from "pinia";
import { ref } from "vue";
import type { ServiceCategoryDefinition } from "@/interfaces";
import { DEFAULT_SERVICE_CATEGORIES } from "@/data/serviceCategoryDefaults";
import {
  loadServiceCategories,
  saveServiceCategories,
} from "@/infrastructure/serviceCategoryStorage";

export const useServiceCategoryStore = defineStore("serviceCategory", () => {
  const categories = ref<ServiceCategoryDefinition[]>([]);

  const initialize = () => {
    const stored = loadServiceCategories();
    categories.value =
      stored && stored.length > 0 ? stored : [...DEFAULT_SERVICE_CATEGORIES];
    if (stored?.length === 0 || !stored) {
      saveServiceCategories(categories.value);
    }
  };

  const getCategoryById = (id: string) =>
    categories.value.find((c) => c.id === id);

  const addCategory = (payload: { label: string; icon: string }) => {
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newCategory: ServiceCategoryDefinition = {
      id,
      label: payload.label.trim(),
      icon: payload.icon || "📋",
    };
    categories.value.push(newCategory);
    saveServiceCategories(categories.value);
    return newCategory;
  };

  const updateCategory = (
    id: string,
    updates: Partial<Pick<ServiceCategoryDefinition, "label" | "icon">>
  ) => {
    const index = categories.value.findIndex((c) => c.id === id);
    if (index === -1) return;
    categories.value[index] = { ...categories.value[index], ...updates };
    saveServiceCategories(categories.value);
  };

  const deleteCategory = (id: string) => {
    categories.value = categories.value.filter((c) => c.id !== id);
    saveServiceCategories(categories.value);
  };

  return {
    categories,
    initialize,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});

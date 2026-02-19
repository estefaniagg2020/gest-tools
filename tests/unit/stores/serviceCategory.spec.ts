import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServiceCategoryStore } from "@/stores/serviceCategory";

vi.mock("@/infrastructure/serviceCategoriesApi", () => ({
  serviceCategoriesApi: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

import { serviceCategoriesApi } from "@/infrastructure/serviceCategoriesApi";

const fakeCat = { id: "cat-1", label: "Masajes", icon: "💆" };

describe("useServiceCategoryStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(serviceCategoriesApi.getCategories).mockResolvedValue([fakeCat]);
    vi.mocked(serviceCategoriesApi.createCategory).mockResolvedValue({ ...fakeCat, id: "cat-new" });
    vi.mocked(serviceCategoriesApi.updateCategory).mockResolvedValue({ ...fakeCat, label: "Masajes Premium" });
    vi.mocked(serviceCategoriesApi.deleteCategory).mockResolvedValue(undefined);
  });

  it("should_start_empty", () => {
    const store = useServiceCategoryStore();
    expect(store.categories).toHaveLength(0);
  });

  it("should_initialize_from_api", async () => {
    const store = useServiceCategoryStore();
    await store.initialize();
    expect(store.categories).toHaveLength(1);
    expect(store.categories[0].label).toBe("Masajes");
    expect(serviceCategoriesApi.getCategories).toHaveBeenCalled();
  });

  it("should_initialize_empty_on_api_error", async () => {
    vi.mocked(serviceCategoriesApi.getCategories).mockRejectedValue(new Error("fail"));
    const store = useServiceCategoryStore();
    await store.initialize();
    expect(store.categories).toHaveLength(0);
  });

  it("should_add_category_via_api", async () => {
    const store = useServiceCategoryStore();
    const result = await store.addCategory({ label: "Masajes", icon: "💆" });
    expect(result.id).toBe("cat-new");
    expect(store.categories).toHaveLength(1);
    expect(serviceCategoriesApi.createCategory).toHaveBeenCalledWith({ label: "Masajes", icon: "💆" });
  });

  it("should_update_category_via_api", async () => {
    const store = useServiceCategoryStore();
    await store.initialize();
    await store.updateCategory("cat-1", { label: "Masajes Premium" });
    expect(store.categories[0].label).toBe("Masajes Premium");
    expect(serviceCategoriesApi.updateCategory).toHaveBeenCalledWith("cat-1", { label: "Masajes Premium" });
  });

  it("should_delete_category_via_api", async () => {
    const store = useServiceCategoryStore();
    await store.initialize();
    await store.deleteCategory("cat-1");
    expect(store.categories).toHaveLength(0);
    expect(serviceCategoriesApi.deleteCategory).toHaveBeenCalledWith("cat-1");
  });

  it("should_getCategoryById_return_correct", async () => {
    const store = useServiceCategoryStore();
    await store.initialize();
    expect(store.getCategoryById("cat-1")).toBeDefined();
    expect(store.getCategoryById("x")).toBeUndefined();
  });

  it("should_addCategoryWithId_skip_if_already_exists", async () => {
    const store = useServiceCategoryStore();
    await store.initialize();
    await store.addCategoryWithId({ id: "cat-1", label: "Duplicado", icon: "🔄" });
    expect(store.categories).toHaveLength(1);
    expect(serviceCategoriesApi.createCategory).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSpaStore } from "@/stores/spa";
import * as spaStorage from "@/utils/spaStorage";

vi.mock("@/utils/spaStorage", () => ({
  loadStoredSpas: vi.fn(),
  loadStoredCurrentSpaId: vi.fn(),
  saveSpaList: vi.fn(),
  saveCurrentSpaId: vi.fn(),
}));

describe("useSpaStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(spaStorage.loadStoredSpas).mockReturnValue(null);
    vi.mocked(spaStorage.loadStoredCurrentSpaId).mockReturnValue(null);
    vi.mocked(spaStorage.saveSpaList).mockImplementation(() => {});
    vi.mocked(spaStorage.saveCurrentSpaId).mockImplementation(() => {});
  });

  it("should_initialize_with_default_spas_when_nothing_stored", () => {
    const store = useSpaStore();
    store.initialize();
    expect(store.spas.length).toBeGreaterThan(0);
    expect(store.currentSpaId).toBe(store.spas[0]?.id ?? "");
  });

  it("should_set_current_spa_and_persist", () => {
    const store = useSpaStore();
    store.initialize();
    const id = store.spas[0]?.id ?? "spa-1";
    store.setCurrentSpa(id);
    expect(store.currentSpaId).toBe(id);
    expect(spaStorage.saveCurrentSpaId).toHaveBeenCalledWith(id);
  });

  it("should_get_spa_by_id", () => {
    const store = useSpaStore();
    store.initialize();
    const spa = store.getSpaById("spa-1");
    expect(spa?.name).toBeDefined();
  });

  it("should_add_spa_with_generated_id", () => {
    const store = useSpaStore();
    store.initialize();
    const before = store.spas.length;
    store.addSpa({ name: "New Spa", themeColor: "red" });
    expect(store.spas).toHaveLength(before + 1);
    expect(store.spas[store.spas.length - 1].id).toBeDefined();
  });

  it("should_update_spa", () => {
    const store = useSpaStore();
    store.initialize();
    const id = store.spas[0]?.id ?? "spa-1";
    store.updateSpa(id, { name: "Updated Name" });
    expect(store.getSpaById(id)?.name).toBe("Updated Name");
  });

  it("should_delete_spa", () => {
    const store = useSpaStore();
    store.initialize();
    const id = store.spas[0]?.id ?? "spa-1";
    const before = store.spas.length;
    store.deleteSpa(id);
    expect(store.spas).toHaveLength(before - 1);
  });
});

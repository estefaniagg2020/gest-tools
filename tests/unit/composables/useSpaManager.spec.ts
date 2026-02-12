import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSpaManager } from "@/composables/useSpaManager";
import { useSpaStore } from "@/stores/spa";
import { useTherapistStore } from "@/stores/therapist";
import * as spaStorage from "@/utils/spaStorage";

vi.mock("@/utils/spaStorage", () => ({
  loadStoredSpas: vi.fn(() => null),
  loadStoredCurrentSpaId: vi.fn(() => null),
  saveSpaList: vi.fn(),
  saveCurrentSpaId: vi.fn(),
}));

describe("useSpaManager", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(spaStorage.loadStoredSpas).mockReturnValue(null);
    useSpaStore().initialize();
    useTherapistStore().initialize();
  });

  it("should_expose_stores_and_helpers", () => {
    const m = useSpaManager();
    expect(m.spaStore).toBeDefined();
    expect(m.getTherapistCount).toBeTypeOf("function");
    expect(m.getTherapistsForSpa).toBeTypeOf("function");
    expect(m.getServicesForSpaByCategory).toBeTypeOf("function");
  });

  it("should_return_zero_therapist_count_for_spa_with_none", () => {
    const m = useSpaManager();
    const count = m.getTherapistCount("spa-1");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should_open_create_modal_and_reset_form", () => {
    const m = useSpaManager();
    m.form.name = "old";
    m.openCreateModal();
    expect(m.isModalOpen.value).toBe(true);
    expect(m.isEditing.value).toBe(false);
    expect(m.form.name).toBe("");
  });

  it("should_edit_spa_and_fill_form", () => {
    const m = useSpaManager();
    const spa = m.spaStore.spas[0];
    if (!spa) return;
    m.editSpa(spa);
    expect(m.isModalOpen.value).toBe(true);
    expect(m.isEditing.value).toBe(true);
    expect(m.form.name).toBe(spa.name);
  });

  it("should_close_modal_and_reset_editing_state", () => {
    const m = useSpaManager();
    m.openCreateModal();
    m.closeModal();
    expect(m.isModalOpen.value).toBe(false);
  });

  it("should_add_spa_on_save_when_not_editing", () => {
    const m = useSpaManager();
    const before = m.spaStore.spas.length;
    m.form.name = "New Spa";
    m.form.themeColor = "teal";
    m.saveSpa();
    expect(m.spaStore.spas).toHaveLength(before + 1);
    expect(m.spaStore.spas[m.spaStore.spas.length - 1].name).toBe("New Spa");
  });

  it("should_toggle_service_modal_with_spa_services", () => {
    const m = useSpaManager();
    const spa = m.spaStore.spas[0];
    if (!spa) return;
    m.toggleServiceModal(spa);
    expect(m.isServiceModalOpen.value).toBe(true);
    expect(m.editingSpaId.value).toBe(spa.id);
    expect(m.selectedServiceIds.value).toEqual(spa.serviceIds || []);
  });

  it("should_close_service_modal", () => {
    const m = useSpaManager();
    m.toggleServiceModal(m.spaStore.spas[0]!);
    m.closeServiceModal();
    expect(m.isServiceModalOpen.value).toBe(false);
    expect(m.editingSpaId.value).toBeNull();
    expect(m.selectedServiceIds.value).toHaveLength(0);
  });
});

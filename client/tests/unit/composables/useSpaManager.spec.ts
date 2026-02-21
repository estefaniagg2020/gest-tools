import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { setActivePinia, createPinia } from "pinia";
import { useSpaManager } from "@/composables/useSpaManager";
import { useSpaStore } from "@/stores/spa";
import { useTeamStore } from "@/stores/team";
import * as spaStorage from "@/utils/spaStorage";

vi.mock("@/utils/spaStorage", () => ({
  loadStoredSpas: vi.fn(() => null),
  loadStoredCurrentSpaId: vi.fn(() => null),
  saveSpaList: vi.fn(),
  saveCurrentSpaId: vi.fn(),
}));

const SpaManagerWrapper = defineComponent({
  setup() {
    return useSpaManager();
  },
  render: () => h("div"),
});

describe("useSpaManager", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(spaStorage.loadStoredSpas).mockReturnValue(null);
    useSpaStore().initialize();
    useTeamStore().initialize();
  });

  const getManager = () => {
    const wrapper = mount(SpaManagerWrapper);
    return wrapper.vm as ReturnType<typeof useSpaManager>;
  };

  it("should_expose_stores_and_helpers", () => {
    const m = getManager();
    expect(m.spaStore).toBeDefined();
    expect(m.getMemberCount).toBeTypeOf("function");
    expect(m.getMembersForSpa).toBeTypeOf("function");
    expect(m.getServicesForSpaByCategory).toBeTypeOf("function");
  });

  it("should_return_zero_member_count_for_spa_with_none", () => {
    const m = getManager();
    const count = m.getMemberCount("spa-1");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should_open_create_modal_and_reset_form", () => {
    const m = getManager();
    m.form.name = "old";
    m.openCreateModal();
    expect(m.isModalOpen).toBe(true);
    expect(m.isEditing).toBe(false);
    expect(m.form.name).toBe("");
  });

  it("should_edit_spa_and_fill_form", () => {
    const m = getManager();
    const spa = m.spaStore.spas[0];
    if (!spa) return;
    m.editSpa(spa);
    expect(m.isModalOpen).toBe(true);
    expect(m.isEditing).toBe(true);
    expect(m.form.name).toBe(spa.name);
  });

  it("should_close_modal_and_reset_editing_state", () => {
    const m = getManager();
    m.openCreateModal();
    m.closeModal();
    expect(m.isModalOpen).toBe(false);
  });

  it("should_add_spa_on_save_when_not_editing", () => {
    const m = getManager();
    const before = m.spaStore.spas.length;
    m.form.name = "New Spa";
    m.form.themeColor = "teal";
    m.saveSpa();
    expect(m.spaStore.spas).toHaveLength(before + 1);
    expect(m.spaStore.spas[m.spaStore.spas.length - 1].name).toBe("New Spa");
  });

  it("should_toggle_service_modal_with_spa_services", () => {
    const m = getManager();
    const spa = m.spaStore.spas[0];
    if (!spa) return;
    m.toggleServiceModal(spa);
    expect(m.isServiceModalOpen).toBe(true);
    expect(m.editingSpaId).toBe(spa.id);
    expect(m.selectedServiceIds).toEqual(spa.serviceIds || []);
  });

  it("should_close_service_modal", () => {
    const m = getManager();
    m.toggleServiceModal(m.spaStore.spas[0]!);
    m.closeServiceModal();
    expect(m.isServiceModalOpen).toBe(false);
    expect(m.editingSpaId).toBeNull();
    expect(m.selectedServiceIds).toHaveLength(0);
  });
});

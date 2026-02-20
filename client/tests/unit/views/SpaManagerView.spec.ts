import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import SpaManagerView from "@/views/SpaManagerView.vue";
import { setActivePinia, createPinia } from "pinia";
import * as spaStorage from "@/utils/spaStorage";

vi.mock("@/utils/spaStorage", () => ({
  loadStoredSpas: vi.fn(() => null),
  loadStoredCurrentSpaId: vi.fn(() => null),
  saveSpaList: vi.fn(),
  saveCurrentSpaId: vi.fn(),
}));

describe("SpaManagerView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(spaStorage.loadStoredSpas).mockReturnValue(null);
  });

  it("should_render_header_and_add_button", () => {
    const wrapper = mount(SpaManagerView);
    expect(wrapper.text()).toContain("Gestión de Spas");
    expect(wrapper.text()).toContain("Añadir Spa");
  });

  it("should_show_spa_list_from_store", async () => {
    const wrapper = mount(SpaManagerView);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".space-y-6").exists()).toBe(true);
  });
});

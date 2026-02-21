import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { setActivePinia, createPinia } from "pinia";
import { useDashboard } from "@/composables/useDashboard";
import { useAuthStore } from "@/stores/auth";
import { useTeamStore } from "@/stores/team";

vi.stubGlobal("alert", vi.fn());

const DashboardWrapper = defineComponent({
  setup() {
    return useDashboard();
  },
  render: () => h("div"),
});

describe("useDashboard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useTeamStore().initialize();
  });

  it("should_return_currentUserName_as_manager_when_manager_user", async () => {
    useAuthStore().setUser("manager", "5");
    const wrapper = mount(DashboardWrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentUserName).toBe("Usuario");
  });

  it("should_return_chartData_and_recentActivity", async () => {
    const wrapper = mount(DashboardWrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartData.length).toBeGreaterThan(0);
    expect(wrapper.vm.recentActivity.length).toBeGreaterThan(0);
  });

  it("should_call_alert_on_handleReport", async () => {
    const wrapper = mount(DashboardWrapper);
    await wrapper.vm.$nextTick();
    wrapper.vm.handleReport();
    expect(alert).toHaveBeenCalled();
  });
});

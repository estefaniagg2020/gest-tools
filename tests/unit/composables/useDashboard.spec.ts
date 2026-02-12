import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useDashboard } from "@/composables/useDashboard";
import { useAuthStore } from "@/stores/auth";
import { useTherapistStore } from "@/stores/therapist";

vi.stubGlobal("alert", vi.fn());

describe("useDashboard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useTherapistStore().initialize();
  });

  it("should_return_currentUserName_as_manager_when_manager_user", () => {
    useAuthStore().setUser("manager", "5");
    const { currentUserName } = useDashboard();
    expect(currentUserName.value).toBe("Antonio");
  });

  it("should_return_chartData_and_recentActivity", () => {
    const { chartData, recentActivity } = useDashboard();
    expect(chartData.value.length).toBeGreaterThan(0);
    expect(recentActivity.value.length).toBeGreaterThan(0);
  });

  it("should_call_alert_on_handleReport", () => {
    const { handleReport } = useDashboard();
    handleReport();
    expect(alert).toHaveBeenCalled();
  });
});

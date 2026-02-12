import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should_initialize_with_default_role_and_user", () => {
    const store = useAuthStore();
    expect(store.currentRole).toBe("manager");
    expect(store.currentUserId).toBe("5");
  });

  it("should_update_role_via_setRole", () => {
    const store = useAuthStore();
    store.setRole("employee");
    expect(store.currentRole).toBe("employee");
  });

  it("should_update_both_via_setUser", () => {
    const store = useAuthStore();
    store.setUser("employee", "1");
    expect(store.currentRole).toBe("employee");
    expect(store.currentUserId).toBe("1");
  });

  it("should_toggle_from_manager_to_employee", () => {
    const store = useAuthStore();
    store.toggleRole();
    expect(store.currentRole).toBe("employee");
    expect(store.currentUserId).toBe("1");
  });

  it("should_toggle_from_employee_to_manager", () => {
    const store = useAuthStore();
    store.setUser("employee", "1");
    store.toggleRole();
    expect(store.currentRole).toBe("manager");
    expect(store.currentUserId).toBe("5");
  });
});

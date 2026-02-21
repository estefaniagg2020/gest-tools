import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/infrastructure/authStorage", () => ({
  loadStoredUsers: vi.fn(),
  saveUsers: vi.fn(),
  loadRememberedSession: vi.fn(),
  saveRememberedSession: vi.fn(),
  clearRememberedSession: vi.fn(),
  loadBackendSession: vi.fn(),
  saveBackendSession: vi.fn(),
  clearBackendSession: vi.fn(),
}));

vi.mock("@/infrastructure/authApi", () => ({
  authApi: {
    getSetupStatus: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
  },
}));

import * as authStorage from "@/infrastructure/authStorage";
import { authApi } from "@/infrastructure/authApi";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(authStorage.loadBackendSession).mockReturnValue(null);
    vi.mocked(authApi.getSetupStatus).mockResolvedValue({ hasUsers: false });
  });

  it("should_initialize_with_default_role_and_user", () => {
    const store = useAuthStore();
    expect(store.currentRole).toBe("manager");
    expect(store.currentUserId).toBe("5");
  });

  it("should_not_be_authenticated_initially", () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
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

  it("should_restore_user_when_remembered_session_exists", async () => {
    vi.mocked(authStorage.loadBackendSession).mockReturnValue({
      token: "t1",
      user: { id: "u1", username: "alice", role: "gestor" },
    });
    const store = useAuthStore();
    await store.initialize();
    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.username).toBe("alice");
  });

  it("should_remain_unauthenticated_when_no_remembered_session", async () => {
    const store = useAuthStore();
    await store.initialize();
    expect(store.isAuthenticated).toBe(false);
  });

  it("should_login_successfully_with_correct_password", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      user: { id: "u1", username: "alice", role: "gestor", name: null, email: null },
      token: "t1",
    });
    const store = useAuthStore();
    const result = await store.login("alice", "correct", false);
    expect(result.ok).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.username).toBe("alice");
    expect(authStorage.saveBackendSession).toHaveBeenCalledWith("t1", expect.any(Object));
  });

  it("should_fail_login_with_wrong_password", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Usuario o contraseña incorrectos"));
    const store = useAuthStore();
    const result = await store.login("alice", "wrong", false);
    expect(result.ok).toBe(false);
    expect("error" in result && result.error).toBeTruthy();
    expect(store.isAuthenticated).toBe(false);
  });

  it("should_register_new_user_and_set_authenticated", async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      user: { id: "u2", username: "bob", role: "gestor", name: null, email: null },
      token: "t2",
    });
    const store = useAuthStore();
    const result = await store.register("bob", "secret123");
    expect(result.ok).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.username).toBe("bob");
    expect(authStorage.saveBackendSession).toHaveBeenCalledWith("t2", expect.any(Object));
  });

  it("should_logout_clear_user_and_remembered_session", async () => {
    vi.mocked(authStorage.loadBackendSession).mockReturnValue({
      token: "t1",
      user: { id: "u1", username: "alice", role: "gestor", name: null, email: null },
    });
    const store = useAuthStore();
    await store.initialize();
    expect(store.isAuthenticated).toBe(true);
    await store.logout();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(authStorage.clearBackendSession).toHaveBeenCalled();
  });

  it("should_hasAnyUser_return_true_when_users_exist", async () => {
    vi.mocked(authApi.getSetupStatus).mockResolvedValue({ hasUsers: true });
    const store = useAuthStore();
    await store.initialize();
    expect(store.hasAnyUser()).toBe(true);
  });

  it("should_hasAnyUser_return_false_when_no_users", async () => {
    const store = useAuthStore();
    await store.initialize();
    expect(store.hasAnyUser()).toBe(false);
  });
});

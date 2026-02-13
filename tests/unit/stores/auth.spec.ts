import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/infrastructure/authStorage", () => ({
  loadStoredUsers: vi.fn(),
  saveUsers: vi.fn(),
  loadRememberedSession: vi.fn(),
  saveRememberedSession: vi.fn(),
  clearRememberedSession: vi.fn(),
}));

vi.mock("@/utils/password", () => ({
  hashPassword: vi.fn((_p: string, _s: string) => Promise.resolve("hashed")),
  verifyPassword: vi.fn((pass: string, _s: string, _h: string) => Promise.resolve(pass === "correct")),
  generateSalt: vi.fn(() => "salt"),
  generateSessionToken: vi.fn(() => "token-1"),
}));

import * as authStorage from "@/infrastructure/authStorage";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue(null);
    vi.mocked(authStorage.loadRememberedSession).mockReturnValue(null);
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
    vi.mocked(authStorage.loadRememberedSession).mockReturnValue({ sessionToken: "t1" });
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue([
      { id: "u1", username: "alice", passwordHash: "h", salt: "s", sessionToken: "t1" },
    ]);
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
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue([
      { id: "u1", username: "alice", passwordHash: "h", salt: "s" },
    ]);
    const store = useAuthStore();
    const result = await store.login("alice", "correct", false);
    expect(result.ok).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.username).toBe("alice");
  });

  it("should_fail_login_with_wrong_password", async () => {
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue([
      { id: "u1", username: "alice", passwordHash: "h", salt: "s" },
    ]);
    const store = useAuthStore();
    const result = await store.login("alice", "wrong", false);
    expect(result.ok).toBe(false);
    expect("error" in result && result.error).toBeTruthy();
    expect(store.isAuthenticated).toBe(false);
  });

  it("should_register_new_user_and_set_authenticated", async () => {
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue(null);
    const store = useAuthStore();
    const result = await store.register("bob", "secret123");
    expect(result.ok).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.username).toBe("bob");
    expect(authStorage.saveUsers).toHaveBeenCalled();
  });

  it("should_logout_clear_user_and_remembered_session", async () => {
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue([
      { id: "u1", username: "alice", passwordHash: "h", salt: "s", sessionToken: "t1" },
    ]);
    vi.mocked(authStorage.loadRememberedSession).mockReturnValue({ sessionToken: "t1" });
    const store = useAuthStore();
    await store.initialize();
    expect(store.isAuthenticated).toBe(true);
    store.logout();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(authStorage.clearRememberedSession).toHaveBeenCalled();
  });

  it("should_hasAnyUser_return_true_when_users_exist", () => {
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue([
      { id: "u1", username: "a", passwordHash: "h", salt: "s" },
    ]);
    const store = useAuthStore();
    expect(store.hasAnyUser()).toBe(true);
  });

  it("should_hasAnyUser_return_false_when_no_users", () => {
    vi.mocked(authStorage.loadStoredUsers).mockReturnValue(null);
    const store = useAuthStore();
    expect(store.hasAnyUser()).toBe(false);
  });
});

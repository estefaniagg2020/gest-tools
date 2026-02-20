import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadStoredUsers,
  saveUsers,
  loadRememberedSession,
  saveRememberedSession,
  clearRememberedSession,
} from "@/infrastructure/authStorage";
import type { StoredUser } from "@/interfaces";

describe("authStorage", () => {
  const KEY_USERS = "auth-users";
  const KEY_REMEMBERED = "auth-remembered";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should_return_null_when_no_users_stored", () => {
    expect(loadStoredUsers()).toBeNull();
  });

  it("should_return_null_for_invalid_json", () => {
    localStorage.setItem(KEY_USERS, "not json");
    expect(loadStoredUsers()).toBeNull();
  });

  it("should_load_and_save_users", () => {
    const users: StoredUser[] = [
      { id: "1", username: "alice", passwordHash: "h1", salt: "s1" },
    ];
    saveUsers(users);
    expect(loadStoredUsers()).toEqual(users);
  });

  it("should_return_null_when_stored_value_is_not_array", () => {
    localStorage.setItem(KEY_USERS, JSON.stringify({ foo: 1 }));
    expect(loadStoredUsers()).toBeNull();
  });

  it("should_return_null_when_no_remembered_session", () => {
    expect(loadRememberedSession()).toBeNull();
  });

  it("should_save_and_load_remembered_session", () => {
    saveRememberedSession("token-abc");
    expect(loadRememberedSession()).toEqual({ sessionToken: "token-abc" });
  });

  it("should_clear_remembered_session", () => {
    saveRememberedSession("token-abc");
    clearRememberedSession();
    expect(loadRememberedSession()).toBeNull();
  });
});

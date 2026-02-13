import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/interfaces";
import { AUTH_CONFIG } from "@/data/authConfig";
import * as authStorage from "@/infrastructure/authStorage";
import { hashPassword, verifyPassword, generateSalt, generateSessionToken } from "@/utils/password";

export type UserRole = "manager" | "employee";

export type LoginResult = { ok: true } | { ok: false; error: string };
export type RegisterResult = { ok: true } | { ok: false; error: string };
export type ForgotPasswordResult = { ok: true } | { ok: false; error: string };

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const currentRole = ref<UserRole>(AUTH_CONFIG.DEFAULT_ROLE as UserRole);
  const currentUserId = ref<string | null>(AUTH_CONFIG.DEFAULT_USER_ID);

  const isAuthenticated = computed(() => user.value !== null);

  const setRole = (role: UserRole) => {
    currentRole.value = role;
  };

  const setUser = (role: UserRole, userId: string | null) => {
    currentRole.value = role;
    currentUserId.value = userId;
  };

  const toggleRole = () => {
    currentRole.value =
      currentRole.value === AUTH_CONFIG.ROLE_MANAGER
        ? (AUTH_CONFIG.ROLE_EMPLOYEE as UserRole)
        : (AUTH_CONFIG.ROLE_MANAGER as UserRole);
    currentUserId.value =
      currentRole.value === AUTH_CONFIG.ROLE_MANAGER
        ? AUTH_CONFIG.TOGGLE_USER_IDS.manager
        : AUTH_CONFIG.TOGGLE_USER_IDS.employee;
  };

  const applyDefaultGestorState = () => {
    currentRole.value = AUTH_CONFIG.DEFAULT_ROLE as UserRole;
    currentUserId.value = AUTH_CONFIG.DEFAULT_USER_ID;
  };

  const initialize = async () => {
    const remembered = authStorage.loadRememberedSession();
    if (!remembered) {
      user.value = null;
      return;
    }
    const users = authStorage.loadStoredUsers();
    if (!users) {
      user.value = null;
      authStorage.clearRememberedSession();
      return;
    }
    const found = users.find((u) => u.sessionToken === remembered.sessionToken);
    if (!found) {
      user.value = null;
      authStorage.clearRememberedSession();
      return;
    }
    user.value = { id: found.id, username: found.username };
    applyDefaultGestorState();
  };

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean,
  ): Promise<LoginResult> => {
    const users = authStorage.loadStoredUsers();
    if (!users) return { ok: false, error: "Usuario o contraseña incorrectos" };
    const stored = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!stored) return { ok: false, error: "Usuario o contraseña incorrectos" };
    const valid = await verifyPassword(password, stored.salt, stored.passwordHash);
    if (!valid) return { ok: false, error: "Usuario o contraseña incorrectos" };
    user.value = { id: stored.id, username: stored.username };
    applyDefaultGestorState();
    if (rememberMe) {
      const sessionToken = generateSessionToken();
      const updated = users.map((u) =>
        u.id === stored.id ? { ...u, sessionToken } : { ...u, sessionToken: undefined },
      );
      authStorage.saveUsers(updated);
      authStorage.saveRememberedSession(sessionToken);
    }
    return { ok: true };
  };

  const logout = () => {
    const users = authStorage.loadStoredUsers();
    if (users && user.value) {
      const updated = users.map((u) =>
        u.id === user.value!.id ? { ...u, sessionToken: undefined } : u,
      );
      authStorage.saveUsers(updated);
    }
    authStorage.clearRememberedSession();
    user.value = null;
    applyDefaultGestorState();
  };

  const register = async (username: string, password: string): Promise<RegisterResult> => {
    const trimmed = username.trim();
    if (!trimmed) return { ok: false, error: "El usuario no puede estar vacío" };
    if (!password || password.length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres" };
    const users = authStorage.loadStoredUsers() ?? [];
    const exists = users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (exists) return { ok: false, error: "Ese usuario ya existe" };
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const id = crypto.randomUUID();
    const newUser = { id, username: trimmed, passwordHash, salt };
    authStorage.saveUsers([...users, newUser]);
    user.value = { id, username: trimmed };
    applyDefaultGestorState();
    return { ok: true };
  };

  const forgotPassword = async (
    username: string,
    newPassword: string,
  ): Promise<ForgotPasswordResult> => {
    const trimmed = username.trim();
    if (!trimmed) return { ok: false, error: "Introduce tu usuario" };
    if (!newPassword || newPassword.length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres" };
    const users = authStorage.loadStoredUsers();
    if (!users) return { ok: false, error: "No existe ninguna cuenta con ese usuario" };
    const stored = users.find((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (!stored) return { ok: false, error: "No existe ninguna cuenta con ese usuario" };
    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);
    const updated = users.map((u) =>
      u.id === stored.id ? { ...u, passwordHash, salt, sessionToken: undefined } : u,
    );
    authStorage.saveUsers(updated);
    authStorage.clearRememberedSession();
    return { ok: true };
  };

  const hasAnyUser = (): boolean => {
    const users = authStorage.loadStoredUsers();
    return users !== null && users.length > 0;
  };

  return {
    user,
    isAuthenticated,
    currentRole,
    currentUserId,
    setRole,
    setUser,
    toggleRole,
    initialize,
    login,
    logout,
    register,
    forgotPassword,
    hasAnyUser,
  };
});

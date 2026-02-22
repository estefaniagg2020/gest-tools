import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/interfaces";
import type { RoleName } from "@/interfaces/auth";
import { AUTH_CONFIG } from "@/data/authConfig";
import * as authStorage from "@/infrastructure/authStorage";
import { authApi } from "@/infrastructure/authApi";

export type UserRole = "manager" | "employee";

export type LoginResult = { ok: true } | { ok: false; error: string };
export type RegisterResult = { ok: true } | { ok: false; error: string };
export type ForgotPasswordResult = { ok: true } | { ok: false; error: string };
export type ActivateAccountResult = { ok: true } | { ok: false; error: string };

const STAFF_ROLES: ReadonlySet<RoleName> = new Set(["superadmin", "admin", "employee"]);

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const currentRole = ref<UserRole>(AUTH_CONFIG.DEFAULT_ROLE as UserRole);
  const currentUserId = ref<string | null>(AUTH_CONFIG.DEFAULT_USER_ID);
  const hasUsersRef = ref<boolean>(false);

  const isAuthenticated = computed(() => user.value !== null);

  const isStaff = computed(
    () => !user.value?.role || STAFF_ROLES.has(user.value.role),
  );
  const isSuperadmin = computed(() => user.value?.role === "superadmin");
  const isAdmin = computed(
    () => user.value?.role === "admin" || user.value?.role === "superadmin",
  );
  const isClient = computed(() => user.value?.role === "client");

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

  const setUserFromBackend = (u: {
    id: string;
    username: string;
    role?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    businessId?: string | null;
  }) => {
    user.value = {
      id: u.id,
      username: u.username,
      role: u.role as User["role"],
      name: u.name,
      email: u.email,
      phone: u.phone,
      businessId: u.businessId,
    };
    applyDefaultGestorState();
  };

  const initialize = async () => {
    const session = authStorage.loadBackendSession();
    if (session) {
      try {
        const me = await authApi.getMe();
        setUserFromBackend(me.user);
        return;
      } catch {
        authStorage.clearBackendSession();
      }
    }
    try {
      const status = await authApi.getSetupStatus();
      hasUsersRef.value = status.hasUsers;
    } catch {
      hasUsersRef.value = false;
    }
    user.value = null;
    authStorage.clearBackendSession();
  };

  const login = async (
    username: string,
    password: string,
    _rememberMe: boolean,
  ): Promise<LoginResult> => {
    try {
      const { user: u, token } = await authApi.login(username, password);
      authStorage.saveBackendSession(token, {
        id: u.id,
        username: u.username,
        role: u.role,
        name: u.name,
        email: u.email,
        phone: u.phone,
        businessId: u.businessId,
      });
      setUserFromBackend(u);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Usuario o contraseña incorrectos",
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    authStorage.clearBackendSession();
    user.value = null;
    applyDefaultGestorState();
  };

  const register = async (
    username: string,
    password: string,
  ): Promise<RegisterResult> => {
    try {
      const { user: u, token } = await authApi.register(username, password);
      authStorage.saveBackendSession(token, {
        id: u.id,
        username: u.username,
        role: u.role,
        name: u.name,
        email: u.email,
        phone: u.phone,
        businessId: u.businessId,
      });
      setUserFromBackend(u);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error al registrar",
      };
    }
  };

  const forgotPassword = async (
    username: string,
    newPassword: string,
  ): Promise<ForgotPasswordResult> => {
    try {
      await authApi.forgotPassword(username, newPassword);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error al cambiar contraseña",
      };
    }
  };

  const activateAccount = async (
    email: string,
    username: string,
    password: string,
  ): Promise<ActivateAccountResult> => {
    try {
      const { user: u, token } = await authApi.activateAccount(email, username, password);
      authStorage.saveBackendSession(token, {
        id: u.id,
        username: u.username,
        role: u.role,
        name: u.name,
        email: u.email,
        phone: u.phone,
        businessId: u.businessId,
      });
      setUserFromBackend(u);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error al activar la cuenta",
      };
    }
  };

  const hasAnyUser = (): boolean => hasUsersRef.value;

  return {
    user,
    isAuthenticated,
    isStaff,
    isSuperadmin,
    isAdmin,
    isClient,
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
    activateAccount,
    hasAnyUser,
  };
});

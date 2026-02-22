import { apiFetch } from "./apiClient";

import type { RoleName } from "@/interfaces/auth";

export interface AuthUser {
  id: string;
  username: string;
  role: RoleName;
  name: string | null;
  email: string | null;
  phone?: string | null;
  businessId?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  getSetupStatus: async (): Promise<{ hasUsers: boolean }> => {
    const res = await apiFetch("/api/auth/setup-status");
    if (!res.ok) throw new Error("Setup status failed");
    return res.json();
  },

  login: async (
    username: string,
    password: string,
  ): Promise<LoginResponse> => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Usuario o contraseña incorrectos");
    }
    return data;
  },

  register: async (
    username: string,
    password: string,
    email?: string,
  ): Promise<LoginResponse> => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email: email || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al registrar");
    }
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    const res = await apiFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al cambiar contraseña");
    }
  },

  logout: async (): Promise<void> => {
    await apiFetch("/api/auth/logout", { method: "POST" });
  },

  getMe: async (): Promise<{ user: AuthUser }> => {
    const res = await apiFetch("/api/auth/me");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Sesión inválida");
    }
    return data;
  },

  forgotPassword: async (
    email: string,
    newPassword: string,
  ): Promise<void> => {
    const res = await apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al cambiar contraseña");
    }
  },

  activateAccount: async (
    email: string,
    username: string,
    password: string,
  ): Promise<LoginResponse> => {
    const res = await apiFetch("/api/auth/activate-account", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al activar la cuenta");
    }
    return data;
  },

  updateProfile: async (payload: {
    name?: string;
    phone?: string;
  }): Promise<{ user: AuthUser }> => {
    const res = await apiFetch("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al actualizar perfil");
    }
    return data;
  },
};

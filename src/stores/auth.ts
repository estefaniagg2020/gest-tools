import { defineStore } from "pinia";
import { ref } from "vue";
import { AUTH_CONFIG } from "@/data/authConfig";

export type UserRole = "manager" | "employee";

export const useAuthStore = defineStore("auth", () => {
  const currentRole = ref<UserRole>(AUTH_CONFIG.DEFAULT_ROLE as UserRole);
  const currentUserId = ref<string | null>(AUTH_CONFIG.DEFAULT_USER_ID);

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

  return {
    currentRole,
    currentUserId,
    setRole,
    setUser,
    toggleRole,
  };
});

import { apiFetch } from "./apiClient";
import type { DashboardStats } from "@/interfaces/dashboardStats";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiFetch("/api/dashboard/stats");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al cargar estadísticas");
    }
    return data as DashboardStats;
  },
};

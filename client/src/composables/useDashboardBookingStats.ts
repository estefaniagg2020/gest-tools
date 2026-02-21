import { ref, onMounted } from "vue";
import { dashboardApi } from "@/infrastructure/dashboardApi";
import type { DashboardStats } from "@/interfaces/dashboardStats";

export const useDashboardBookingStats = () => {
  const stats = ref<DashboardStats | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const load = async () => {
    loading.value = true;
    error.value = null;
    try {
      stats.value = await dashboardApi.getStats();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error("Error desconocido");
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    load();
  });

  return {
    stats,
    loading,
    error,
    load,
  };
};

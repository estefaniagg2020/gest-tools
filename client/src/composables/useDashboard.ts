import { computed, ref, onMounted } from "vue";
import { useAuthStore, type UserRole } from "@/stores/auth";
import { useTeamStore } from "@/stores/team";
import { DASHBOARD_CONSTANTS } from "@/data/constants";
import { AUTH_CONFIG } from "@/data/authConfig";
import { DASHBOARD_CHART_DATA, DASHBOARD_RECENT_ACTIVITY } from "@/data/dashboardConfig";

export const useDashboard = () => {
  const authStore = useAuthStore();
  const teamStore = useTeamStore();

  onMounted(async () => {
    await teamStore.initialize();
  });

  const isManagerUserId = (id: string | null) =>
    id != null && AUTH_CONFIG.MANAGER_USER_IDS.includes(id as (typeof AUTH_CONFIG.MANAGER_USER_IDS)[number]);

  const currentUserName = computed(() => {
    if (isManagerUserId(authStore.currentUserId)) return AUTH_CONFIG.MANAGER_DISPLAY_NAME;
    const member = teamStore.getMemberById(authStore.currentUserId || "");
    return member ? member.name : DASHBOARD_CONSTANTS.DEFAULT_USER_NAME;
  });

  const currentUserPhoto = computed(() => {
    if (isManagerUserId(authStore.currentUserId)) return "";
    const member = teamStore.getMemberById(authStore.currentUserId || "");
    return member ? member.photoUrl : "";
  });

  const currentUserSelection = computed({
    get: () => {
      if (authStore.currentUserId === AUTH_CONFIG.MANAGER_USER_ID) return AUTH_CONFIG.MANAGER_USER_ID;
      return authStore.currentUserId || AUTH_CONFIG.MANAGER_USER_ID;
    },
    set: (userId: string) => {
      if (userId === AUTH_CONFIG.MANAGER_USER_ID) {
        authStore.setUser(AUTH_CONFIG.ROLE_MANAGER as UserRole, AUTH_CONFIG.MANAGER_USER_ID);
      } else {
        const member = teamStore.getMemberById(userId);
        if (member) {
          const role: UserRole =
            member.role === "admin" ? AUTH_CONFIG.ROLE_MANAGER : AUTH_CONFIG.ROLE_EMPLOYEE;
          authStore.setUser(role, member.id);
        }
      }
    },
  });

  const currentDate = computed(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const chartData = ref([...DASHBOARD_CHART_DATA]);
  const recentActivity = ref([...DASHBOARD_RECENT_ACTIVITY]);

  const handleReport = () => {
    alert(DASHBOARD_CONSTANTS.REPORT_SIMULATION_MSG);
  };

  return {
    authStore,
    teamStore,
    currentUserName,
    currentUserPhoto,
    currentUserSelection,
    currentDate,
    chartData,
    recentActivity,
    handleReport,
  };
};

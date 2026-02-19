import { defineStore } from "pinia";
import { computed } from "vue";
import type { LayoutConfig, SidebarPosition, CalendarAppearance } from "@/interfaces";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useAuthStore } from "@/stores/auth";

export const useLayoutStore = defineStore("layout", () => {
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();

  // Computed views over gestorConfigStore (source of truth in DB)
  const sidebarPosition = computed<SidebarPosition>(
    () => configStore.sidebarPosition as SidebarPosition,
  );
  const showNavbar = computed(() => configStore.showNavbar);
  const calendarAppearance = computed<CalendarAppearance>(
    () => configStore.calendarAppearance as CalendarAppearance,
  );
  const sidebarModuleIds = computed(() => configStore.sidebarModuleIds);
  const dashboardModuleIds = computed(() => configStore.dashboardModuleIds);

  const showSidebar = computed(() => sidebarPosition.value !== "none");

  const persist = async (updates: Partial<LayoutConfig>) => {
    const currentConfig = configStore.getConfig();
    await configStore.setConfig(
      authStore.user?.id || authStore.currentUserId || "default",
      { ...currentConfig, ...updates },
      authStore.user?.businessId,
    );
  };

  // initialize is a no-op — gestorConfigStore.initialize() loads everything from API
  const initialize = (_userId: string) => {};

  const setLayout = async (config: LayoutConfig) => {
    await persist(config);
  };

  const setSidebarPosition = async (position: SidebarPosition) => {
    await persist({ sidebarPosition: position });
  };

  const setShowNavbar = async (value: boolean) => {
    await persist({ showNavbar: value });
  };

  const setCalendarAppearance = async (appearance: CalendarAppearance) => {
    await persist({ calendarAppearance: appearance });
  };

  const setSidebarModuleIds = async (ids: string[]) => {
    await persist({ sidebarModuleIds: ids });
  };

  const setDashboardModuleIds = async (ids: string[]) => {
    await persist({ dashboardModuleIds: ids });
  };

  const getConfig = (): LayoutConfig => ({
    sidebarPosition: sidebarPosition.value,
    showNavbar: showNavbar.value,
    calendarAppearance: calendarAppearance.value,
    sidebarModuleIds: [...sidebarModuleIds.value],
    dashboardModuleIds: [...dashboardModuleIds.value],
  });

  return {
    sidebarPosition,
    showNavbar,
    calendarAppearance,
    sidebarModuleIds,
    dashboardModuleIds,
    showSidebar,
    initialize,
    setLayout,
    setSidebarPosition,
    setShowNavbar,
    setCalendarAppearance,
    setSidebarModuleIds,
    setDashboardModuleIds,
    getConfig,
  };
});

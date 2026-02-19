import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { LayoutConfig, SidebarPosition, CalendarAppearance } from "@/interfaces";
import { DEFAULT_LAYOUT_CONFIG } from "@/interfaces";
import * as layoutStorage from "@/infrastructure/layoutStorage";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

export const useLayoutStore = defineStore("layout", () => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  const sidebarPosition = ref<SidebarPosition>(DEFAULT_LAYOUT_CONFIG.sidebarPosition);
  const showNavbar = ref(DEFAULT_LAYOUT_CONFIG.showNavbar);
  const calendarAppearance = ref<CalendarAppearance>(DEFAULT_LAYOUT_CONFIG.calendarAppearance);
  const sidebarModuleIds = ref<string[]>([...DEFAULT_LAYOUT_CONFIG.sidebarModuleIds]);
  const dashboardModuleIds = ref<string[]>([...DEFAULT_LAYOUT_CONFIG.dashboardModuleIds]);

  const showSidebar = computed(
    () => sidebarPosition.value !== "none"
  );

  const initialize = (userId: string) => {
    const stored = layoutStorage.loadLayoutConfig(userId);
    
    if (stored) {
      sidebarPosition.value = stored.sidebarPosition;
      showNavbar.value = stored.showNavbar;
      calendarAppearance.value = stored.calendarAppearance;
      sidebarModuleIds.value = [...stored.sidebarModuleIds];
      dashboardModuleIds.value =
        stored.dashboardModuleIds.length > 0
          ? [...stored.dashboardModuleIds]
          : [...DEFAULT_LAYOUT_CONFIG.dashboardModuleIds];
    } else {
      sidebarPosition.value = DEFAULT_LAYOUT_CONFIG.sidebarPosition;
      showNavbar.value = DEFAULT_LAYOUT_CONFIG.showNavbar;
      calendarAppearance.value = DEFAULT_LAYOUT_CONFIG.calendarAppearance;
      sidebarModuleIds.value = [...DEFAULT_LAYOUT_CONFIG.sidebarModuleIds];
      dashboardModuleIds.value = [...DEFAULT_LAYOUT_CONFIG.dashboardModuleIds];
    }
  };

  const setLayout = (config: LayoutConfig) => {
    sidebarPosition.value = config.sidebarPosition;
    showNavbar.value = config.showNavbar;
    calendarAppearance.value = config.calendarAppearance;
    sidebarModuleIds.value = [...config.sidebarModuleIds];
    dashboardModuleIds.value = [...config.dashboardModuleIds];
    const uid = user.value?.id;
    if (uid) layoutStorage.saveLayoutConfig(uid, config);
  };

  const setSidebarPosition = (position: SidebarPosition) => {
    sidebarPosition.value = position;
    persist();
  };

  const setShowNavbar = (value: boolean) => {
    showNavbar.value = value;
    persist();
  };

  const setCalendarAppearance = (appearance: CalendarAppearance) => {
    calendarAppearance.value = appearance;
    persist();
  };

  const setSidebarModuleIds = (ids: string[]) => {
    sidebarModuleIds.value = [...ids];
    persist();
  };

  const setDashboardModuleIds = (ids: string[]) => {
    dashboardModuleIds.value = [...ids];
    persist();
  };

  const persist = () => {
    const uid = user.value?.id;
    if (!uid) return;
    layoutStorage.saveLayoutConfig(uid, {
      sidebarPosition: sidebarPosition.value,
      showNavbar: showNavbar.value,
      calendarAppearance: calendarAppearance.value,
      sidebarModuleIds: sidebarModuleIds.value,
      dashboardModuleIds: dashboardModuleIds.value,
    });
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

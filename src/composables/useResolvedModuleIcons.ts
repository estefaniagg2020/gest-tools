import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layout";
import { useModuleIconsStore } from "@/stores/moduleIcons";
import { orderModulesByIds, resolveLayoutModuleIcons } from "@/data/layoutModules";
import { resolveDashboardCardIcons } from "@/data/dashboardModules";

export const useResolvedLayoutModules = () => {
  const layoutStore = useLayoutStore();
  const moduleIconsStore = useModuleIconsStore();
  const { sidebarModuleIds } = storeToRefs(layoutStore);
  return computed(() => {
    const ordered = orderModulesByIds(sidebarModuleIds.value);
    return resolveLayoutModuleIcons(ordered, (c) => moduleIconsStore.getIcon(c));
  });
};

export const useResolvedDashboardCards = () => {
  const moduleIconsStore = useModuleIconsStore();
  return computed(() =>
    resolveDashboardCardIcons((c) => moduleIconsStore.getIcon(c))
  );
};

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layout";
import { useModuleIconsStore } from "@/stores/moduleIcons";
import * as layoutModules from "@/data/layoutModules";
import { resolveDashboardCardIcons } from "@/data/dashboardModules";

export const useResolvedLayoutModules = () => {
  const { t } = useI18n();
  const layoutStore = useLayoutStore();
  const moduleIconsStore = useModuleIconsStore();
  const { sidebarModuleIds } = storeToRefs(layoutStore);
  return computed(() => {
    const ordered = layoutModules.orderModulesByIds(sidebarModuleIds.value);
    const withIcons = layoutModules.resolveLayoutModuleIcons(ordered, (c) => moduleIconsStore.getIcon(c));
    return withIcons.map((m) => ({ ...m, label: t(m.labelKey) }));
  });
};

export const useResolvedDashboardCards = () => {
  const moduleIconsStore = useModuleIconsStore();
  return computed(() =>
    resolveDashboardCardIcons((c) => moduleIconsStore.getIcon(c))
  );
};

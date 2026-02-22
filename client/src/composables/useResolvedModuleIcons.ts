import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layout";
import { useModuleIconsStore } from "@/stores/moduleIcons";
import { useBillingConfig } from "@/composables/useBillingConfig";
import * as layoutModules from "@/data/layoutModules";
import { resolveDashboardCardIcons } from "@/data/dashboardModules";

export const useResolvedLayoutModules = () => {
  const { t } = useI18n();
  const layoutStore = useLayoutStore();
  const moduleIconsStore = useModuleIconsStore();
  const { bonosEnabled, serviciosEnabled, inventarioEnabled } = useBillingConfig();
  const { sidebarModuleIds } = storeToRefs(layoutStore);
  return computed(() => {
    const ordered = layoutModules.orderModulesByIds(sidebarModuleIds.value);
    const withIcons = layoutModules.resolveLayoutModuleIcons(ordered, (c) => moduleIconsStore.getIcon(c));
    const withLabels = withIcons.map((m) => ({ ...m, label: t(m.labelKey) }));
    return withLabels.filter((m) => {
      // HIDDEN_FEATURE: bonos - Oculta módulo Bonos del sidebar si bonosEnabled=false
      if (m.id === "bonos") return bonosEnabled.value;
      if (m.id === "servicios") return serviciosEnabled.value;
      // HIDDEN_FEATURE: inventario - Oculta módulo Inventario del sidebar si inventarioEnabled=false
      if (m.id === "inventario") return inventarioEnabled.value;
      return true;
    });
  });
};

export const useResolvedDashboardCards = () => {
  const moduleIconsStore = useModuleIconsStore();
  return computed(() =>
    resolveDashboardCardIcons((c) => moduleIconsStore.getIcon(c))
  );
};

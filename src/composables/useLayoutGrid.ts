import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layout";
import { orderModulesByIds } from "@/data/layoutModules";
import type { SidebarPosition, CalendarAppearance } from "@/interfaces";

export const SIDEBAR_OPTIONS: { value: SidebarPosition; label: string }[] = [
  { value: "left", label: "Izquierda" },
  { value: "right", label: "Derecha" },
  { value: "none", label: "Sin barra lateral" },
];

export const CALENDAR_APPEARANCE_OPTIONS: { value: CalendarAppearance; label: string; description: string }[] = [
  { value: "default", label: "Estándar", description: "Franjas y espaciado normales" },
  { value: "compact", label: "Compacto", description: "Más citas visibles en pantalla" },
  { value: "spacious", label: "Amplio", description: "Más espacio entre bloques" },
];

export const useLayoutGrid = () => {
  const layoutStore = useLayoutStore();
  const {
    sidebarPosition,
    showNavbar,
    calendarAppearance,
    sidebarModuleIds,
  } = storeToRefs(layoutStore);

  const orderedModules = computed(() => orderModulesByIds(sidebarModuleIds.value));

  const moveModule = (fromIndex: number, toIndex: number) => {
    const ids = [...sidebarModuleIds.value];
    const [removed] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, removed);
    layoutStore.setSidebarModuleIds(ids);
  };

  const reorderFromDrag = (draggedId: string, targetId: string) => {
    const ids = [...sidebarModuleIds.value];
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const [removed] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, removed);
    layoutStore.setSidebarModuleIds(ids);
  };

  return {
    sidebarPosition,
    showNavbar,
    calendarAppearance,
    sidebarModuleIds,
    orderedModules,
    setSidebarPosition: layoutStore.setSidebarPosition,
    setShowNavbar: layoutStore.setShowNavbar,
    setCalendarAppearance: layoutStore.setCalendarAppearance,
    moveModule,
    reorderFromDrag,
  };
};

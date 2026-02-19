import type { LayoutConfig } from "@/interfaces";
import { DEFAULT_LAYOUT_CONFIG, DEFAULT_DASHBOARD_MODULE_IDS } from "@/interfaces";

const KEY_PREFIX = "layout-config-";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

function normalizeStored(value: unknown): LayoutConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  const sidebarPosition =
    o.sidebarPosition === "left" || o.sidebarPosition === "right" || o.sidebarPosition === "none"
      ? o.sidebarPosition
      : DEFAULT_LAYOUT_CONFIG.sidebarPosition;
  const showNavbar = typeof o.showNavbar === "boolean" ? o.showNavbar : DEFAULT_LAYOUT_CONFIG.showNavbar;
  const calendarAppearance =
    o.calendarAppearance === "default" ||
    o.calendarAppearance === "compact" ||
    o.calendarAppearance === "spacious"
      ? o.calendarAppearance
      : DEFAULT_LAYOUT_CONFIG.calendarAppearance;
  let sidebarModuleIds = isStringArray(o.sidebarModuleIds)
    ? o.sidebarModuleIds
    : DEFAULT_LAYOUT_CONFIG.sidebarModuleIds;
  if (sidebarModuleIds.includes("centros") && !sidebarModuleIds.includes("servicios")) {
    sidebarModuleIds = sidebarModuleIds.map((id) => (id === "centros" ? "servicios" : id));
  }
  if (sidebarModuleIds.includes("therapists")) {
    sidebarModuleIds = sidebarModuleIds.map((id) => (id === "therapists" ? "equipo" : id));
  }
  let dashboardModuleIds = isStringArray(o.dashboardModuleIds)
    ? o.dashboardModuleIds.filter((id) => DEFAULT_DASHBOARD_MODULE_IDS.includes(id))
    : DEFAULT_LAYOUT_CONFIG.dashboardModuleIds;
  if (dashboardModuleIds.length === 0) {
    dashboardModuleIds = [...DEFAULT_LAYOUT_CONFIG.dashboardModuleIds];
  }
  return {
    sidebarPosition,
    showNavbar,
    calendarAppearance,
    sidebarModuleIds,
    dashboardModuleIds,
  };
}

export function loadLayoutConfig(userId: string): LayoutConfig | null {
  const raw = localStorage.getItem(KEY_PREFIX + userId);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeStored(parsed);
  } catch {
    return null;
  }
}

export function saveLayoutConfig(userId: string, config: LayoutConfig): void {
  localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(config));
}

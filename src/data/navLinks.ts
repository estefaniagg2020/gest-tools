export interface NavLinkItem {
  to: string;
  icon: string;
  labelKey: string;
}

/** Ruta raíz (configuración / inicio) */
export const ROUTE_HOME = "/" as const;

export const NAV_LINKS: readonly NavLinkItem[] = [
  { to: "/", icon: "🏠", labelKey: "nav.home" },
  { to: "/scheduler", icon: "📅", labelKey: "nav.agenda" },
  { to: "/team", icon: "👥", labelKey: "nav.team" },
  { to: "/services", icon: "📋", labelKey: "nav.services" },
] as const;

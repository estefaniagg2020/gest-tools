export interface NavLinkItem {
  to: string;
  icon: string;
  label: string;
}

/** Ruta raíz (dashboard/inicio) para comparaciones sin strings mágicos */
export const ROUTE_HOME = "/" as const;

export const NAV_LINKS: readonly NavLinkItem[] = [
  { to: "/scheduler", icon: "📅", label: "Agenda" },
  { to: "/therapists", icon: "👥", label: "Equipo" },
  { to: "/spas", icon: "🏢", label: "Centros" },
] as const;

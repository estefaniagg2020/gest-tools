export interface NavLinkItem {
  to: string;
  icon: string;
  label: string;
}

/** Ruta raíz (configuración / inicio) */
export const ROUTE_HOME = "/" as const;

export const NAV_LINKS: readonly NavLinkItem[] = [
  { to: "/", icon: "🏠", label: "Inicio" },
  { to: "/scheduler", icon: "📅", label: "Agenda" },
  { to: "/therapists", icon: "👥", label: "Equipo" },
  { to: "/servicios", icon: "📋", label: "Servicios" },
] as const;

import type { ModuleIconCategory } from "@/interfaces/moduleIcons";

export interface DashboardCard {
  id: string;
  to: string;
  title: string;
  description: string;
  icon: string;
  accent: "teal" | "violet" | "amber" | "sky" | "rose";
}

const DASHBOARD_CARD_ICON_CATEGORY: Partial<Record<string, ModuleIconCategory>> = {
  horarios: "calendarios",
  personal: "personas",
  servicios: "servicios",
  inventario: "inventario",
};

export const DASHBOARD_CARDS: readonly DashboardCard[] = [
  {
    id: "personal",
    to: "/therapists",
    title: "Gestión de personal",
    description: "Equipo, terapeutas y roles.",
    icon: "👥",
    accent: "teal",
  },
  {
    id: "horarios",
    to: "/scheduler",
    title: "Gestión de horarios de empleados",
    description: "Agenda, turnos y disponibilidad.",
    icon: "📅",
    accent: "sky",
  },
  {
    id: "servicios",
    to: "/servicios",
    title: "Gestión de servicios",
    description: "Catálogo de servicios y precios.",
    icon: "📋",
    accent: "violet",
  },
  {
    id: "inventario",
    to: "/inventario",
    title: "Inventario",
    description: "Stock y productos.",
    icon: "📦",
    accent: "amber",
  },
  {
    id: "config",
    to: "/config",
    title: "Configuración",
    description: "Ajustes del gestor, temas y agenda.",
    icon: "⚙️",
    accent: "teal",
  },
];

export function resolveDashboardCardIcons(
  getIcon: (category: ModuleIconCategory) => string
): DashboardCard[] {
  return DASHBOARD_CARDS.map((card) => {
    const category = DASHBOARD_CARD_ICON_CATEGORY[card.id];
    const icon = category ? getIcon(category) : card.icon;
    return { ...card, icon };
  });
}

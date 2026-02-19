import type { ModuleIconCategory } from "@/interfaces/moduleIcons";

export interface LayoutModule {
  id: string;
  labelKey: string;
  icon: string;
  to: string;
  activeClass?: string;
  section?: "principal" | "gestion";
  iconOnly?: boolean;
}

const LAYOUT_MODULE_ICON_CATEGORY: Partial<Record<string, ModuleIconCategory>> = {
  agenda: "calendarios",
  equipo: "personas",
  servicios: "servicios",
  clientes: "clientes",
  inventario: "inventario",
};

export const LAYOUT_MODULES: readonly LayoutModule[] = [
  { id: "inicio", labelKey: "nav.home", icon: "🏠", to: "/", activeClass: "bg-slate-100 text-slate-800", section: "principal" },
  { id: "agenda", labelKey: "nav.agenda", icon: "📅", to: "/scheduler", activeClass: "bg-orange-50 text-orange-600", section: "principal" },
  { id: "equipo", labelKey: "nav.team", icon: "👥", to: "/team", activeClass: "bg-teal-50 text-teal-600", section: "gestion" },
  { id: "clientes", labelKey: "nav.clients", icon: "👤", to: "/clients", activeClass: "bg-rose-50 text-rose-600", section: "gestion" },
  { id: "bonos", labelKey: "nav.bonos", icon: "🎫", to: "/bonos", activeClass: "bg-violet-50 text-violet-600", section: "gestion" },
  { id: "servicios", labelKey: "nav.services", icon: "📋", to: "/services", activeClass: "bg-sky-50 text-sky-600", section: "gestion" },
  { id: "inventario", labelKey: "nav.inventory", icon: "📦", to: "/inventory", activeClass: "bg-amber-50 text-amber-600", section: "gestion" },
  { id: "config", labelKey: "nav.config", icon: "⚙️", to: "/config", activeClass: "bg-slate-100 text-slate-700", section: "gestion", iconOnly: true },
];

export const LAYOUT_MODULE_IDS = LAYOUT_MODULES.map((m) => m.id);

export function getLayoutModuleById(id: string): LayoutModule | undefined {
  return LAYOUT_MODULES.find((m) => m.id === id);
}

export function orderModulesByIds(ids: string[]): LayoutModule[] {
  const byId = new Map(LAYOUT_MODULES.map((m) => [m.id, m]));
  const ordered: LayoutModule[] = [];
  for (const id of ids) {
    const mod = byId.get(id);
    if (mod) ordered.push(mod);
  }
  for (const m of LAYOUT_MODULES) {
    if (!ids.includes(m.id)) ordered.push(m);
  }
  return ordered;
}

export function resolveLayoutModuleIcons(
  modules: LayoutModule[],
  getIcon: (category: ModuleIconCategory) => string
): LayoutModule[] {
  return modules.map((m) => {
    const category = LAYOUT_MODULE_ICON_CATEGORY[m.id];
    const icon = category ? getIcon(category) : m.icon;
    return { ...m, icon };
  });
}

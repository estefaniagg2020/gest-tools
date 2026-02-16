import type { ModuleIconCategory } from "@/interfaces/moduleIcons";

export interface LayoutModule {
  id: string;
  label: string;
  icon: string;
  to: string;
  activeClass?: string;
  section?: "principal" | "gestion";
}

const LAYOUT_MODULE_ICON_CATEGORY: Partial<Record<string, ModuleIconCategory>> = {
  agenda: "calendarios",
  equipo: "personas",
  servicios: "servicios",
  clientes: "clientes",
};

export const LAYOUT_MODULES: readonly LayoutModule[] = [
  { id: "inicio", label: "Inicio", icon: "🏠", to: "/", activeClass: "bg-slate-100 text-slate-800", section: "principal" },
  { id: "agenda", label: "Agenda", icon: "📅", to: "/scheduler", activeClass: "bg-orange-50 text-orange-600", section: "principal" },
  { id: "equipo", label: "Equipo", icon: "👥", to: "/therapists", activeClass: "bg-teal-50 text-teal-600", section: "gestion" },
  { id: "clientes", label: "Clientes", icon: "👤", to: "/clientes", activeClass: "bg-rose-50 text-rose-600", section: "gestion" },
  { id: "servicios", label: "Servicios", icon: "📋", to: "/servicios", activeClass: "bg-sky-50 text-sky-600", section: "gestion" },
  { id: "config", label: "Configuración", icon: "⚙️", to: "/config", activeClass: "bg-slate-100 text-slate-700", section: "gestion" },
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

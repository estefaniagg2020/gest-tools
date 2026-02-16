import type { ModuleIconsConfig } from "@/interfaces/moduleIcons";
import { DEFAULT_MODULE_ICONS } from "@/data/moduleIconOptions";

const KEY_PREFIX = "module-icons-";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function normalizeStored(value: unknown): ModuleIconsConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  const calendarios = isString(o.calendarios) ? o.calendarios : DEFAULT_MODULE_ICONS.calendarios;
  const personas = isString(o.personas) ? o.personas : DEFAULT_MODULE_ICONS.personas;
  const servicios = isString(o.servicios) ? o.servicios : DEFAULT_MODULE_ICONS.servicios;
  const inventario = isString(o.inventario) ? o.inventario : DEFAULT_MODULE_ICONS.inventario;
  const clientes = isString(o.clientes) ? o.clientes : DEFAULT_MODULE_ICONS.clientes;
  return { calendarios, personas, servicios, inventario, clientes };
}

export function loadModuleIcons(userId: string): ModuleIconsConfig | null {
  const raw = localStorage.getItem(KEY_PREFIX + userId);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeStored(parsed);
  } catch {
    return null;
  }
}

export function saveModuleIcons(userId: string, config: ModuleIconsConfig): void {
  localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(config));
}

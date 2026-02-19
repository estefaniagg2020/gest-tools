import type { BonoTemplate, ClientBono } from "@/interfaces/bono";

const KEY_TEMPLATES = "bono-templates";
const KEY_CLIENT_BONOS = "bono-client-bonos";

export const loadBonoTemplates = (): BonoTemplate[] | null => {
  const raw = localStorage.getItem(KEY_TEMPLATES);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveBonoTemplates = (templates: BonoTemplate[]): void => {
  localStorage.setItem(KEY_TEMPLATES, JSON.stringify(templates));
};

export const loadClientBonos = (): ClientBono[] | null => {
  const raw = localStorage.getItem(KEY_CLIENT_BONOS);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveClientBonos = (bonos: ClientBono[]): void => {
  localStorage.setItem(KEY_CLIENT_BONOS, JSON.stringify(bonos));
};

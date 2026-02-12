import type { Spa } from "@/interfaces";

const KEY_LIST = "spa-list";
const KEY_CURRENT_ID = "spa-current-id";

/**
 * Adapter de persistencia para SPAs (localStorage).
 * Única responsabilidad: leer y deserializar; sin lógica de negocio.
 */
export function loadStoredSpas(): Spa[] | null {
  const raw = localStorage.getItem(KEY_LIST);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadStoredCurrentSpaId(): string | null {
  return localStorage.getItem(KEY_CURRENT_ID);
}

export function saveSpaList(spas: Spa[]): void {
  localStorage.setItem(KEY_LIST, JSON.stringify(spas));
}

export function saveCurrentSpaId(id: string): void {
  localStorage.setItem(KEY_CURRENT_ID, id);
}

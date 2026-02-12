import type { Spa } from "@/interfaces";

const KEY_LIST = "spa-list";
const KEY_CURRENT_ID = "spa-current-id";

export const loadStoredSpas = (): Spa[] | null => {
  const raw = localStorage.getItem(KEY_LIST);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const loadStoredCurrentSpaId = (): string | null => localStorage.getItem(KEY_CURRENT_ID);

export const saveSpaList = (spas: Spa[]): void => {
  localStorage.setItem(KEY_LIST, JSON.stringify(spas));
};

export const saveCurrentSpaId = (id: string): void => {
  localStorage.setItem(KEY_CURRENT_ID, id);
};

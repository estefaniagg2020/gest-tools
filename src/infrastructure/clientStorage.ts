import type { Client } from "@/interfaces";

const KEY_LIST = "client-list";

export function loadStoredClients(): Client[] | null {
  const raw = localStorage.getItem(KEY_LIST);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveClientList(clients: Client[]): void {
  localStorage.setItem(KEY_LIST, JSON.stringify(clients));
}

import type { Service } from "@/interfaces";

const KEY_LIST = "service-list";

export function loadStoredServices(): Service[] | null {
  const raw = localStorage.getItem(KEY_LIST);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveServiceList(services: Service[]): void {
  localStorage.setItem(KEY_LIST, JSON.stringify(services));
}

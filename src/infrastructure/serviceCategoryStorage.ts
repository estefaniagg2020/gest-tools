import type { ServiceCategoryDefinition } from "@/interfaces";

const KEY_LIST = "service-categories";

export function loadServiceCategories(): ServiceCategoryDefinition[] | null {
  const raw = localStorage.getItem(KEY_LIST);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (item): item is ServiceCategoryDefinition =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ServiceCategoryDefinition).id === "string" &&
        typeof (item as ServiceCategoryDefinition).label === "string" &&
        typeof (item as ServiceCategoryDefinition).icon === "string"
    );
  } catch {
    return null;
  }
}

export function saveServiceCategories(categories: ServiceCategoryDefinition[]): void {
  localStorage.setItem(KEY_LIST, JSON.stringify(categories));
}

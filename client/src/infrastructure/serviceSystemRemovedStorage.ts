import { businessConfigApi } from "./businessConfigApi";

const KEY = "service-system-removed";

type RemovedByType = Record<string, string[]>;

const loadLocal = (): RemovedByType => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: RemovedByType = {};
    for (const [businessType, arr] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
        out[businessType] = arr as string[];
      }
    }
    return out;
  } catch {
    return {};
  }
};

const saveLocal = (data: RemovedByType): void => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export type RemovedOptions = {
  businessId: string | null;
  businessType: string;
};

export const getRemovedSystemServiceNames = async (
  options: RemovedOptions,
): Promise<string[]> => {
  const { businessId, businessType } = options;
  if (businessId) {
    try {
      const config = await businessConfigApi.getConfig(businessId);
      const list = config?.hiddenSystemServiceNames;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
  if (!businessType) return [];
  const data = loadLocal();
  const names = data[businessType];
  return Array.isArray(names) ? names : [];
};

export const markSystemServiceRemoved = async (
  options: RemovedOptions & { serviceName: string },
): Promise<void> => {
  const { businessId, businessType, serviceName } = options;
  const name = serviceName.trim();
  if (!name) return;

  if (businessId) {
    try {
      const config = await businessConfigApi.getConfig(businessId);
      const current = config?.hiddenSystemServiceNames ?? [];
      const normalized = name.toLowerCase();
      if (current.some((n) => n.toLowerCase() === normalized)) return;
      await businessConfigApi.updateConfig(businessId, {
        hiddenSystemServiceNames: [...current, name],
      });
    } catch {
      // ignore
    }
    return;
  }

  if (!businessType) return;
  const data = loadLocal();
  const list = data[businessType] ?? [];
  if (list.some((n) => n.toLowerCase() === name.toLowerCase())) return;
  data[businessType] = [...list, name];
  saveLocal(data);
};

export const clearRemovedSystemService = (
  businessType: string,
  serviceName: string,
): void => {
  if (!businessType) return;
  const data = loadLocal();
  const list = data[businessType] ?? [];
  const normalized = serviceName.trim().toLowerCase();
  data[businessType] = list.filter((n) => n.toLowerCase() !== normalized);
  saveLocal(data);
};

const KEY = "service-templates-seeded";

type SeedMap = Record<string, boolean>;

const loadSeedMap = (): SeedMap => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return Object.keys(parsed as Record<string, unknown>).reduce<SeedMap>(
      (acc, key) => {
        acc[key] = Boolean((parsed as Record<string, unknown>)[key]);
        return acc;
      },
      {},
    );
  } catch {
    return {};
  }
};

const saveSeedMap = (map: SeedMap): void => {
  localStorage.setItem(KEY, JSON.stringify(map));
};

export const isBusinessTypeSeeded = (businessType: string): boolean => {
  if (!businessType) return false;
  const map = loadSeedMap();
  return Boolean(map[businessType]);
};

export const markBusinessTypeSeeded = (businessType: string): void => {
  if (!businessType) return;
  const map = loadSeedMap();
  if (map[businessType]) return;
  map[businessType] = true;
  saveSeedMap(map);
};


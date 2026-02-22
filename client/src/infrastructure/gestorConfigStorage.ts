import type { GestorConfig } from "@/interfaces";

const memoryByUser = new Map<string, GestorConfig>();

export const loadGestorConfig = (userId: string): GestorConfig | null => {
  const current = memoryByUser.get(userId);
  if (!current) return null;
  const cloned = JSON.parse(JSON.stringify(current)) as GestorConfig;
  if (!Array.isArray(cloned.teamMembers)) cloned.teamMembers = [];
  return cloned;
};

export const saveGestorConfig = (
  userId: string,
  config: GestorConfig,
): void => {
  const cloned = JSON.parse(JSON.stringify(config)) as GestorConfig;
  if (!Array.isArray(cloned.teamMembers)) cloned.teamMembers = [];
  memoryByUser.set(userId, cloned);
};

export const resetGestorConfigStorage = (): void => {
  memoryByUser.clear();
};

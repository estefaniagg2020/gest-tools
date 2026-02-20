import { loadAvatarCache, saveAvatarCache } from "@/infrastructure/avatarCacheStorage";

const ANIMAL_IMAGE_BASE = "https://randomfox.ca/images";
const ANIMAL_IMAGE_COUNT = 122;

const hashToIndex = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % ANIMAL_IMAGE_COUNT) + 1;
};

/**
 * Genera una URL de avatar de animal (determinista por seed).
 * Usa Random Fox (randomfox.ca); el mismo seed devuelve siempre la misma imagen.
 */
export const getAvatarUrlForName = (name: string, _size = 200): string => {
  const seed = (name || "?").trim();
  const index = hashToIndex(seed);
  return `${ANIMAL_IMAGE_BASE}/${index}.jpg`;
};

const cacheKey = (name: string, size: number): string => `${name.trim() || "?"}|${size}`;

export const getCachedAvatarUrlForName = (name: string, size = 200): string => {
  const key = cacheKey(name, size);
  const cache = loadAvatarCache();
  const cached = cache[key];
  if (cached) return cached;
  const url = getAvatarUrlForName(name, size);
  cache[key] = url;
  saveAvatarCache(cache);
  return url;
};

/**
 * URL de avatar de animal aleatorio (p. ej. para nuevo terapeuta).
 * Usa timestamp como seed para variar.
 */
export const getRandomAnimalAvatarUrl = (): string => {
  const index = hashToIndex(String(Date.now() + Math.random()));
  return `${ANIMAL_IMAGE_BASE}/${index}.jpg`;
};

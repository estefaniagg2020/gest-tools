let memoryAvatarCache: Record<string, string> = {};

/**
 * Carga el mapa de caché (clave "nombre|tamaño" -> URL) desde memoria.
 */
export const loadAvatarCache = (): Record<string, string> => {
  return { ...memoryAvatarCache };
};

/**
 * Guarda el mapa de caché en memoria.
 */
export const saveAvatarCache = (cache: Record<string, string>): void => {
  memoryAvatarCache = { ...cache };
};

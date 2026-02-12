const KEY = "spa-avatar-url-cache";

/**
 * Carga el mapa de caché (clave "nombre|tamaño" -> URL) desde localStorage.
 * Solo IO: sin lógica de negocio.
 */
export const loadAvatarCache = (): Record<string, string> => {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === "string" && typeof v === "string") out[k] = v;
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
};

/**
 * Guarda el mapa de caché en localStorage.
 * Solo IO.
 */
export const saveAvatarCache = (cache: Record<string, string>): void => {
  localStorage.setItem(KEY, JSON.stringify(cache));
};

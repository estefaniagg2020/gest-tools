import { apiFetch } from "./apiClient";

export interface PublicBusinessService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  description?: string;
  gestorConfig?: { logoUrl?: string };
  contact?: { address?: string };
  services: PublicBusinessService[];
}

export const publicBusinessApi = {
  getBySlug: async (slug: string): Promise<PublicBusiness> => {
    const res = await apiFetch(
      `/api/public/business/${encodeURIComponent(slug)}`,
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data?.error === "string" && data.error.trim() !== ""
          ? data.error
          : "No se pudo cargar el negocio";
      throw new Error(message);
    }
    return data as PublicBusiness;
  },
};

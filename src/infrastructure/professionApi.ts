import { apiFetch } from "./apiClient";

export interface ProfessionService {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string | null;
}

export interface ProfessionCategory {
  id: string;
  label: string;
  icon: string;
  services: ProfessionService[];
}

export interface Profession {
  id: string;
  label: string;
  categories?: ProfessionCategory[];
}

export interface DiscoverResponse {
  source: "database" | "ai";
  valid?: boolean;
  reason?: string;
  profession?: Profession & { categories: ProfessionCategory[] };
}

export const professionApi = {
  getById: async (id: string): Promise<(Profession & { categories: ProfessionCategory[] }) | null> => {
    const res = await apiFetch(`/api/professions/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return res.json();
  },

  search: async (q: string): Promise<Profession[]> => {
    const res = await apiFetch(`/api/professions/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    return res.json();
  },

  discover: async (professionName: string): Promise<DiscoverResponse> => {
    const res = await apiFetch("/api/professions/discover", {
      method: "POST",
      body: JSON.stringify({ professionName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al descubrir la profesión");
    return data;
  },
};

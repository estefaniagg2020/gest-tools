import { apiFetch } from "./apiClient";

export interface PublicBranding {
  companyName: string;
  logoUrl: string | null;
}

export const publicBrandingApi = {
  getBranding: async (): Promise<PublicBranding | null> => {
    const res = await apiFetch("/api/public/branding");
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as PublicBranding;
    if (typeof data?.companyName !== "string") return null;
    return {
      companyName: data.companyName,
      logoUrl: data.logoUrl === null || typeof data.logoUrl === "string" ? data.logoUrl : null,
    };
  },
};

import { apiFetch } from "./apiClient";

export interface BusinessConfig {
  id?: string;
  businessId?: string;
  whatsappRemindersEnabled?: boolean;
  whatsappPhoneNumberId?: string | null;
  [key: string]: unknown;
}

export const businessConfigApi = {
  getConfig: async (businessId: string): Promise<BusinessConfig | null> => {
    const res = await apiFetch(`/api/businesses/${businessId}/config`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error al cargar la configuración");
    return res.json();
  },

  updateConfig: async (
    businessId: string,
    payload: Partial<BusinessConfig>,
  ): Promise<BusinessConfig> => {
    const res = await apiFetch(`/api/businesses/${businessId}/config`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al guardar la configuración");
    }
    return data;
  },
};

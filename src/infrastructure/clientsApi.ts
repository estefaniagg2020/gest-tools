import { apiFetch } from "./apiClient";
import type { Client } from "@/interfaces";

export const clientsApi = {
  getClients: async (): Promise<Client[]> => {
    const res = await apiFetch("/api/clients");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar clientes");
    return Array.isArray(data) ? data : [];
  },

  createClient: async (payload: Omit<Client, "id">): Promise<Client> => {
    const res = await apiFetch("/api/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al crear cliente");
    return data as Client;
  },

  updateClient: async (id: string, payload: Partial<Omit<Client, "id">>): Promise<Client> => {
    const res = await apiFetch(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar cliente");
    return data as Client;
  },

  deleteClient: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar cliente");
    }
  },
};

import { apiFetch } from "./apiClient";
import type { ScheduleBlock } from "@/interfaces";

export const scheduleBlocksApi = {
  getBlocks: async (): Promise<ScheduleBlock[]> => {
    const res = await apiFetch("/api/schedule-blocks");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar bloques");
    return Array.isArray(data) ? data : [];
  },

  createBlock: async (payload: Omit<ScheduleBlock, "id">): Promise<ScheduleBlock> => {
    const res = await apiFetch("/api/schedule-blocks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al crear bloque");
    return data as ScheduleBlock;
  },

  updateBlock: async (id: string, payload: Partial<ScheduleBlock>): Promise<ScheduleBlock> => {
    const res = await apiFetch(`/api/schedule-blocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar bloque");
    return data as ScheduleBlock;
  },

  deleteBlock: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/schedule-blocks/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar bloque");
    }
  },
};

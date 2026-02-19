import { apiFetch } from "./apiClient";
import type { TimeWindow } from "@/composables/useSlotFinder";

export interface ParsedSlotQuery {
  windows: TimeWindow[];
  durationMinutes: number;
}

export const aiApi = {
  parseSlotQuery: async (text: string): Promise<ParsedSlotQuery> => {
    const res = await apiFetch("/api/ai/parse-slot-query", {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "Error al procesar la consulta con IA");
    }

    return res.json() as Promise<ParsedSlotQuery>;
  },
};

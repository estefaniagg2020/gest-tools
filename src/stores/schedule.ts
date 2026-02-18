import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScheduleBlock } from "@/interfaces";

const STORAGE_KEY = "gestor-schedule-blocks";

export const useScheduleStore = defineStore("schedule", () => {
  const blocks = ref<ScheduleBlock[]>([]);

  const persistBlocks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks.value));
  };

  const isValidBlockType = (value: unknown): value is ScheduleBlock["type"] =>
    value === "work" || value === "vacation" || value === "training" || value === "admin" || value === "other";

  const normalizeStoredBlocks = (value: unknown): ScheduleBlock[] => {
    if (!Array.isArray(value)) return [];
    const normalized: ScheduleBlock[] = [];
    for (const raw of value) {
      if (typeof raw !== "object" || raw === null) continue;
      const o = raw as Record<string, unknown>;
      const start = typeof o.start === "string" ? o.start : "";
      const end = typeof o.end === "string" ? o.end : "";
      if (!start || !end) continue;

      const id = typeof o.id === "string" && o.id.trim().length > 0 ? o.id : crypto.randomUUID();
      const memberId =
        (typeof o.memberId === "string" && o.memberId) ||
        (typeof o.therapistId === "string" && o.therapistId) ||
        "";
      if (!memberId) continue;

      const type = isValidBlockType(o.type) ? o.type : "other";
      const title = typeof o.title === "string" && o.title.trim().length > 0 ? o.title : "Evento";
      const description = typeof o.description === "string" && o.description ? o.description : undefined;
      const status =
        o.status === "confirmed" || o.status === "pending" || o.status === "cancelled" ? o.status : undefined;
      const serviceId = typeof o.serviceId === "string" && o.serviceId ? o.serviceId : undefined;

      normalized.push({
        id,
        memberId,
        start,
        end,
        type,
        title,
        description,
        status,
        serviceId,
      });
    }
    return normalized;
  };

  const initialize = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        blocks.value = normalizeStoredBlocks(parsed);
        persistBlocks();
      } catch (e) {
        console.error("Error parsing schedule blocks", e);
        blocks.value = [];
      }
    }
  };

  const addBlock = (block: Omit<ScheduleBlock, "id">) => {
    const newBlock: ScheduleBlock = {
      ...block,
      id: crypto.randomUUID(),
    };
    blocks.value.push(newBlock);
    persistBlocks();
  };

  const updateBlock = (id: string, updates: Partial<ScheduleBlock>) => {
    const exists = blocks.value.some((block) => block.id === id);
    if (!exists) return;
    blocks.value = blocks.value.map((block) =>
      block.id === id ? { ...block, ...updates } : block,
    );
    persistBlocks();
  };

  const deleteBlock = (id: string) => {
    blocks.value = blocks.value.filter((block) => block.id !== id);
    persistBlocks();
  };

  const cancelBlock = (id: string) => {
    const exists = blocks.value.some((block) => block.id === id);
    if (!exists) return;
    blocks.value = blocks.value.map((block) =>
      block.id === id ? { ...block, status: "cancelled" } : block,
    );
    persistBlocks();
  };

  const clearAllBlocks = () => {
    blocks.value = [];
    persistBlocks();
  };

  const getBlocksByMember = (memberId: string) => {
    return blocks.value.filter((block) => block.memberId === memberId);
  };

  return {
    blocks,
    initialize,
    addBlock,
    updateBlock,
    deleteBlock,
    cancelBlock,
    clearAllBlocks,
    getBlocksByMember,
  };
});

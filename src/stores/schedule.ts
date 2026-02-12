import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import { INDEX_NOT_FOUND } from "@/data/constants";

const STORAGE_KEY = "spa-schedule-blocks";

export const useScheduleStore = defineStore("schedule", () => {
  const blocks = ref<ScheduleBlock[]>([]);

  const persistBlocks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks.value));
  };

  const initialize = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        blocks.value = JSON.parse(stored);
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
    const index = blocks.value.findIndex((block) => block.id === id);
    if (index !== INDEX_NOT_FOUND) {
      blocks.value[index] = { ...blocks.value[index], ...updates };
      persistBlocks();
    }
  };

  const deleteBlock = (id: string) => {
    blocks.value = blocks.value.filter((block) => block.id !== id);
    persistBlocks();
  };

  const getBlocksByTherapist = (therapistId: string) => {
    return blocks.value.filter((block) => block.therapistId === therapistId);
  };

  return {
    blocks,
    initialize,
    addBlock,
    updateBlock,
    deleteBlock,
    getBlocksByTherapist,
  };
});

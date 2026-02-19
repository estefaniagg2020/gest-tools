import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import { scheduleBlocksApi } from "@/infrastructure/scheduleBlocksApi";

export const useScheduleStore = defineStore("schedule", () => {
  const blocks = ref<ScheduleBlock[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      blocks.value = await scheduleBlocksApi.getBlocks();
    } catch {
      blocks.value = [];
    }
  };

  const addBlock = async (block: Omit<ScheduleBlock, "id">): Promise<ScheduleBlock> => {
    const created = await scheduleBlocksApi.createBlock(block);
    blocks.value.push(created);
    return created;
  };

  const updateBlock = async (id: string, updates: Partial<ScheduleBlock>): Promise<void> => {
    const updated = await scheduleBlocksApi.updateBlock(id, updates);
    const index = blocks.value.findIndex((b) => b.id === id);
    if (index !== -1) blocks.value[index] = updated;
  };

  const deleteBlock = async (id: string): Promise<void> => {
    await scheduleBlocksApi.deleteBlock(id);
    blocks.value = blocks.value.filter((b) => b.id !== id);
  };

  const cancelBlock = async (id: string): Promise<void> => {
    await updateBlock(id, { status: "cancelled" });
  };

  const clearAllBlocks = async (): Promise<void> => {
    for (const b of blocks.value) {
      try { await scheduleBlocksApi.deleteBlock(b.id); } catch { /* continue */ }
    }
    blocks.value = [];
  };

  const getBlocksByMember = (memberId: string) =>
    blocks.value.filter((b) => b.memberId === memberId);

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

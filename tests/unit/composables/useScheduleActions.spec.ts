import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { flushPromises } from "@vue/test-utils";
import { useScheduleActions } from "@/composables/useScheduleActions";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/infrastructure/scheduleBlocksApi", () => ({
  scheduleBlocksApi: {
    getBlocks: vi.fn().mockResolvedValue([]),
    createBlock: vi.fn(),
    updateBlock: vi.fn(),
    deleteBlock: vi.fn().mockResolvedValue(undefined),
  },
}));

import { scheduleBlocksApi } from "@/infrastructure/scheduleBlocksApi";
import { useAuthStore } from "@/stores/auth";
import { useScheduleStore } from "@/stores/schedule";

const baseBlock = {
  memberId: "th-1",
  start: "2025-02-03T09:00:00.000Z",
  end: "2025-02-03T10:00:00.000Z",
  type: "work" as const,
  title: "Turno",
  status: "confirmed" as const,
};

describe("useScheduleActions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(scheduleBlocksApi.createBlock).mockImplementation(async (block) => ({ ...block, id: "b-new" }));
    vi.mocked(scheduleBlocksApi.updateBlock).mockImplementation(async (id, updates) => ({ ...baseBlock, id, ...updates }));
  });

  it("should_create_new_block_when_no_editingBlock", async () => {
    useAuthStore().setUser("manager", "5");
    const scheduleStore = useScheduleStore();
    const { saveBlock } = useScheduleActions();
    const onSuccess = vi.fn();

    saveBlock({
      data: {
        title: "Nuevo turno",
        start: "09:00",
        end: "10:00",
        type: "work",
      },
      memberId: "th-1",
      currentDate: new Date(2025, 1, 3),
      selectedDate: new Date(2025, 1, 3),
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalled();
    await flushPromises();
    expect(scheduleStore.blocks).toHaveLength(1);
    expect(scheduleStore.blocks[0].title).toBe("Nuevo turno");
  });

  it("should_update_existing_block_when_editingBlock_provided", async () => {
    useAuthStore().setUser("manager", "5");
    const scheduleStore = useScheduleStore();

    // Add initial block through the store
    await scheduleStore.addBlock(baseBlock);
    const editingBlock = scheduleStore.blocks[0];

    vi.mocked(scheduleBlocksApi.updateBlock).mockResolvedValue({ ...editingBlock, title: "Actualizado" });

    const { saveBlock } = useScheduleActions();
    const onSuccess = vi.fn();

    saveBlock({
      data: { title: "Actualizado", start: "09:00", end: "11:00" },
      memberId: "th-1",
      currentDate: new Date(2025, 1, 3),
      editingBlock,
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalled();
    await flushPromises();
    expect(scheduleStore.blocks[0].title).toBe("Actualizado");
  });
});

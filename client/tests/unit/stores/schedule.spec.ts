import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useScheduleStore } from "@/stores/schedule";

vi.mock("@/infrastructure/scheduleBlocksApi", () => ({
  scheduleBlocksApi: {
    getBlocks: vi.fn(),
    createBlock: vi.fn(),
    updateBlock: vi.fn(),
    deleteBlock: vi.fn(),
  },
}));

import { scheduleBlocksApi } from "@/infrastructure/scheduleBlocksApi";

const blockInput = {
  memberId: "th-1",
  start: "2025-02-03T09:00:00.000Z",
  end: "2025-02-03T10:00:00.000Z",
  type: "work" as const,
  title: "Turno",
};

const fakeBlock = { ...blockInput, id: "b-1" };

describe("useScheduleStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(scheduleBlocksApi.getBlocks).mockResolvedValue([fakeBlock]);
    vi.mocked(scheduleBlocksApi.createBlock).mockResolvedValue({ ...fakeBlock, id: "b-new" });
    vi.mocked(scheduleBlocksApi.updateBlock).mockResolvedValue({ ...fakeBlock, title: "Updated" });
    vi.mocked(scheduleBlocksApi.deleteBlock).mockResolvedValue(undefined);
  });

  it("should_start_with_empty_blocks", () => {
    const store = useScheduleStore();
    expect(store.blocks).toEqual([]);
  });

  it("should_initialize_from_api", async () => {
    const store = useScheduleStore();
    await store.initialize();
    expect(store.blocks).toHaveLength(1);
    expect(store.blocks[0].title).toBe("Turno");
    expect(scheduleBlocksApi.getBlocks).toHaveBeenCalled();
  });

  it("should_initialize_empty_on_api_error", async () => {
    vi.mocked(scheduleBlocksApi.getBlocks).mockRejectedValue(new Error("fail"));
    const store = useScheduleStore();
    await store.initialize();
    expect(store.blocks).toHaveLength(0);
  });

  it("should_add_block_via_api", async () => {
    const store = useScheduleStore();
    const created = await store.addBlock(blockInput);
    expect(created.id).toBe("b-new");
    expect(store.blocks).toHaveLength(1);
    expect(scheduleBlocksApi.createBlock).toHaveBeenCalledWith(blockInput);
  });

  it("should_update_block_via_api", async () => {
    const store = useScheduleStore();
    await store.initialize();
    await store.updateBlock("b-1", { title: "Updated" });
    expect(store.blocks[0].title).toBe("Updated");
    expect(scheduleBlocksApi.updateBlock).toHaveBeenCalledWith("b-1", { title: "Updated" });
  });

  it("should_delete_block_via_api", async () => {
    const store = useScheduleStore();
    await store.initialize();
    await store.deleteBlock("b-1");
    expect(store.blocks).toHaveLength(0);
    expect(scheduleBlocksApi.deleteBlock).toHaveBeenCalledWith("b-1");
  });

  it("should_cancel_block_sets_status_cancelled", async () => {
    vi.mocked(scheduleBlocksApi.updateBlock).mockResolvedValue({ ...fakeBlock, status: "cancelled" });
    const store = useScheduleStore();
    await store.initialize();
    await store.cancelBlock("b-1");
    expect(store.blocks[0].status).toBe("cancelled");
    expect(scheduleBlocksApi.updateBlock).toHaveBeenCalledWith("b-1", { status: "cancelled" });
  });

  it("should_getBlocksByMember_filter_correctly", async () => {
    vi.mocked(scheduleBlocksApi.getBlocks).mockResolvedValue([
      fakeBlock,
      { ...fakeBlock, id: "b-2", memberId: "th-2" },
    ]);
    const store = useScheduleStore();
    await store.initialize();
    expect(store.getBlocksByMember("th-1")).toHaveLength(1);
    expect(store.getBlocksByMember("th-2")).toHaveLength(1);
    expect(store.getBlocksByMember("th-99")).toHaveLength(0);
  });
});

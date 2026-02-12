import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useScheduleStore } from "@/stores/schedule";

const STORAGE_KEY = "spa-schedule-blocks";

const createBlockInput = () => ({
  therapistId: "th-1",
  start: "2025-02-03T09:00:00.000Z",
  end: "2025-02-03T10:00:00.000Z",
  type: "work" as const,
  title: "Turno",
});

describe("useScheduleStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.removeItem(STORAGE_KEY);
  });

  it("should_start_with_empty_blocks", () => {
    const store = useScheduleStore();
    expect(store.blocks).toEqual([]);
  });

  it("should_add_block_with_generated_id", () => {
    const store = useScheduleStore();
    const input = createBlockInput();
    store.addBlock(input);
    expect(store.blocks).toHaveLength(1);
    expect(store.blocks[0]).toMatchObject(input);
    expect(store.blocks[0].id).toBeDefined();
  });

  it("should_update_block_by_id", () => {
    const store = useScheduleStore();
    store.addBlock(createBlockInput());
    const id = store.blocks[0].id;
    store.updateBlock(id, { title: "Updated" });
    expect(store.blocks[0].title).toBe("Updated");
  });

  it("should_delete_block_by_id", () => {
    const store = useScheduleStore();
    store.addBlock(createBlockInput());
    const id = store.blocks[0].id;
    store.deleteBlock(id);
    expect(store.blocks).toHaveLength(0);
  });

  it("should_return_blocks_by_therapist", () => {
    const store = useScheduleStore();
    store.addBlock(createBlockInput());
    store.addBlock({ ...createBlockInput(), therapistId: "th-2" });
    const forTh1 = store.getBlocksByTherapist("th-1");
    expect(forTh1).toHaveLength(1);
    expect(forTh1[0].therapistId).toBe("th-1");
  });

  it("should_initialize_from_localStorage", () => {
    const stored = [
      {
        id: "b1",
        therapistId: "th-1",
        start: "2025-02-03T09:00:00.000Z",
        end: "2025-02-03T10:00:00.000Z",
        type: "work",
        title: "Stored",
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const store = useScheduleStore();
    store.initialize();
    expect(store.blocks).toHaveLength(1);
    expect(store.blocks[0].title).toBe("Stored");
  });
});

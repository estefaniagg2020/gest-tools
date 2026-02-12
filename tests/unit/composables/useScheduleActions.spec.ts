import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useScheduleActions } from "@/composables/useScheduleActions";
import { useAuthStore } from "@/stores/auth";
import { useScheduleStore } from "@/stores/schedule";

describe("useScheduleActions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.removeItem("spa-schedule-blocks");
  });

  it("should_create_new_block_when_no_editingBlock", () => {
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
      therapistId: "th-1",
      currentDate: new Date(2025, 1, 3),
      onSuccess,
    });

    expect(scheduleStore.blocks).toHaveLength(1);
    expect(scheduleStore.blocks[0].title).toBe("Nuevo turno");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should_update_existing_block_when_editingBlock_provided", () => {
    useAuthStore().setUser("manager", "5");
    const scheduleStore = useScheduleStore();
    scheduleStore.addBlock({
      therapistId: "th-1",
      start: "2025-02-03T09:00:00.000Z",
      end: "2025-02-03T10:00:00.000Z",
      type: "work",
      title: "Original",
    });
    const editingBlock = scheduleStore.blocks[0];
    const { saveBlock } = useScheduleActions();
    const onSuccess = vi.fn();

    saveBlock({
      data: { title: "Actualizado", start: "09:00", end: "11:00" },
      therapistId: "th-1",
      currentDate: new Date(2025, 1, 3),
      editingBlock,
      onSuccess,
    });

    expect(scheduleStore.blocks).toHaveLength(1);
    expect(scheduleStore.blocks[0].title).toBe("Actualizado");
    expect(onSuccess).toHaveBeenCalled();
  });
});

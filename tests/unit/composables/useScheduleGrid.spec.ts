import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useScheduleGrid } from "@/composables/useScheduleGrid";

describe("useScheduleGrid", () => {
  it("should_compute_slotStarts_between_start_and_end", () => {
    const grid = useScheduleGrid(ref(8), ref(12), ref(60), ref(60));
    expect(grid.slotStarts.value).toHaveLength(4);
    expect(grid.slotStarts.value[0]).toBe(8);
    expect(grid.slotStarts.value[3]).toBe(11);
  });

  it("should_compute_totalHeight", () => {
    const grid = useScheduleGrid(ref(8), ref(18), ref(60));
    expect(grid.totalHeight.value).toBe(600);
  });

  it("should_include_formatSlotLabel", () => {
    const grid = useScheduleGrid(ref(8), ref(10), ref(60));
    expect(grid.formatSlotLabel(9)).toBe("09:00");
  });

  it("should_return_slot_start_from_click_within_range", () => {
    const grid = useScheduleGrid(ref(8), ref(18), ref(60), ref(60));
    const event = { offsetY: 120 } as MouseEvent;
    const slot = grid.getSlotStartFromClick(event, 0);
    expect(slot).toBe(10);
  });

  it("should_return_null_when_click_outside_range", () => {
    const grid = useScheduleGrid(ref(8), ref(10), ref(60), ref(60));
    const event = { offsetY: 500 } as MouseEvent;
    const slot = grid.getSlotStartFromClick(event, 0);
    expect(slot).toBeNull();
  });
});

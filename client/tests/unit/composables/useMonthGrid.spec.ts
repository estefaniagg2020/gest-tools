import { describe, it, expect } from "vitest";
import { ref } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import { useMonthGrid } from "@/composables/useMonthGrid";

describe("useMonthGrid", () => {
  it("should_return_42_days", () => {
    const currentDate = ref(new Date(2025, 0, 15));
    const blocks = ref<ScheduleBlock[]>([]);
    const { days } = useMonthGrid(currentDate, blocks);
    expect(days.value).toHaveLength(42);
  });

  it("should_have_date_isCurrentMonth_isToday_blocks_per_cell", () => {
    const currentDate = ref(new Date(2025, 0, 15));
    const blocks = ref<ScheduleBlock[]>([]);
    const { days } = useMonthGrid(currentDate, blocks);
    const first = days.value[0];
    expect(first).toHaveProperty("date");
    expect(first).toHaveProperty("isCurrentMonth");
    expect(first).toHaveProperty("isToday");
    expect(first).toHaveProperty("blocks");
    expect(Array.isArray(first.blocks)).toBe(true);
  });

  it("should_assign_blocks_to_matching_day", () => {
    const currentDate = ref(new Date(2025, 0, 15));
    const block: ScheduleBlock = {
      id: "b1",
      therapistId: "th-1",
      start: "2025-01-15T09:00:00.000Z",
      end: "2025-01-15T10:00:00.000Z",
      type: "work",
      title: "Turno",
    };
    const blocks = ref<ScheduleBlock[]>([block]);
    const { days } = useMonthGrid(currentDate, blocks);
    const dayWithBlock = days.value.find((d) => d.blocks.length > 0);
    expect(dayWithBlock).toBeDefined();
    expect(dayWithBlock!.blocks[0].title).toBe("Turno");
  });
});

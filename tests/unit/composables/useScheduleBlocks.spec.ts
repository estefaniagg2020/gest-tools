import { describe, it, expect } from "vitest";
import type { ScheduleBlock } from "@/interfaces";
import { filterBlocksByDay, filterBlocksByDayAndTherapist, useScheduleBlocks } from "@/composables/useScheduleBlocks";

const block = (date: string, therapistId: string): ScheduleBlock => ({
  id: "b1",
  therapistId,
  start: date,
  end: date.replace("T09:", "T10:"),
  type: "work",
  title: "Turno",
});

describe("useScheduleBlocks", () => {
  describe("filterBlocksByDay", () => {
    it("should_return_blocks_on_given_date", () => {
      const blocks = [block("2025-02-03T09:00:00.000Z", "th-1"), block("2025-02-04T09:00:00.000Z", "th-1")];
      const day = new Date(2025, 1, 3);
      const result = filterBlocksByDay(blocks, day);
      expect(result).toHaveLength(1);
      expect(result[0].start).toContain("2025-02-03");
    });

    it("should_return_empty_when_no_blocks_on_date", () => {
      const blocks = [block("2025-02-03T09:00:00.000Z", "th-1")];
      const day = new Date(2025, 1, 5);
      expect(filterBlocksByDay(blocks, day)).toHaveLength(0);
    });
  });

  describe("filterBlocksByDayAndTherapist", () => {
    it("should_return_blocks_on_date_for_therapist", () => {
      const blocks = [block("2025-02-03T09:00:00.000Z", "th-1"), block("2025-02-03T11:00:00.000Z", "th-2")];
      const day = new Date(2025, 1, 3);
      const result = filterBlocksByDayAndTherapist(blocks, day, "th-1");
      expect(result).toHaveLength(1);
      expect(result[0].therapistId).toBe("th-1");
    });
  });

  describe("useScheduleBlocks", () => {
    it("should_return_filter_functions", () => {
      const composable = useScheduleBlocks();
      expect(composable.filterBlocksByDay).toBe(filterBlocksByDay);
      expect(composable.filterBlocksByDayAndTherapist).toBe(filterBlocksByDayAndTherapist);
    });
  });
});

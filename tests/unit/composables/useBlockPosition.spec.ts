import { describe, it, expect } from "vitest";
import { ref } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import { useBlockPosition } from "@/composables/useBlockPosition";

const createBlock = (start: string, end: string): ScheduleBlock => ({
  id: "b1",
  therapistId: "th-1",
  start,
  end,
  type: "work",
  title: "Turno",
});

describe("useBlockPosition", () => {
  it("should_compute_top_as_number_based_on_start_and_pixels", () => {
    const block = ref(createBlock("2025-02-03T09:00:00.000Z", "2025-02-03T10:00:00.000Z"));
    const { top } = useBlockPosition(block, ref(8), ref(60));
    expect(typeof top.value).toBe("number");
  });

  it("should_compute_height_from_duration_one_hour_equals_pixelsPerHour", () => {
    const block = ref(createBlock("2025-02-03T09:00:00.000Z", "2025-02-03T10:00:00.000Z"));
    const { height } = useBlockPosition(block, ref(8), ref(60));
    expect(height.value).toBe(60);
  });

  it("should_return_cardStyle_with_top_and_height_px", () => {
    const block = ref(createBlock("2025-02-03T09:00:00.000Z", "2025-02-03T10:00:00.000Z"));
    const { cardStyle } = useBlockPosition(block, ref(8), ref(60), ref(0));
    expect(cardStyle.value.top).toMatch(/^-?\d+px$/);
    expect(cardStyle.value.height).toMatch(/^\d+px$/);
  });

  it("should_set_isSmall_when_height_under_40", () => {
    const block = ref(createBlock("2025-02-03T09:00:00.000Z", "2025-02-03T09:30:00.000Z"));
    const { height, isSmall } = useBlockPosition(block, ref(8), ref(60));
    expect(height.value).toBe(30);
    expect(isSmall.value).toBe(true);
  });
});

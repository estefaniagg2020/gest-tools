import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Therapist } from "@/interfaces";
import { generateScheduleBlocks } from "@/utils/scheduleGenerator";

const createTherapist = (overrides: Partial<Therapist> = {}): Therapist =>
  ({
    id: "t1",
    name: "Test Therapist",
    photoUrl: "",
    phoneNumber: "",
    email: "test@test.com",
    weeklyHours: 40,
    color: "#000",
    role: "therapist",
    spaId: "spa1",
    defaultWorkStartHour: 9,
    defaultWorkEndHour: 18,
    ...overrides,
  }) as Therapist;

describe("generateScheduleBlocks", () => {
  const monday2025 = new Date("2025-02-03T00:00:00.000Z");

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should_return_empty_array_when_no_therapists", () => {
    const result = generateScheduleBlocks([], monday2025);
    expect(result).toEqual([]);
  });

  it("should_return_blocks_with_required_fields", () => {
    const therapists = [createTherapist()];
    const result = generateScheduleBlocks(therapists, monday2025);
    expect(result.length).toBeGreaterThan(0);
    for (const block of result) {
      expect(block).toHaveProperty("therapistId");
      expect(block).toHaveProperty("start");
      expect(block).toHaveProperty("end");
      expect(block).toHaveProperty("type");
      expect(block).toHaveProperty("title");
      expect(block).not.toHaveProperty("id");
    }
  });

  it("should_return_only_blocks_for_given_therapists", () => {
    const t1 = createTherapist({ id: "th1" });
    const t2 = createTherapist({ id: "th2" });
    const result = generateScheduleBlocks([t1, t2], monday2025);
    const therapistIds = [...new Set(result.map((b) => b.therapistId))];
    expect(therapistIds).toContain("th1");
    expect(therapistIds).toContain("th2");
    expect(therapistIds.length).toBe(2);
  });

  it("should_use_therapist_work_hours_when_provided", () => {
    const therapist = createTherapist({ defaultWorkStartHour: 8, defaultWorkEndHour: 17 });
    const result = generateScheduleBlocks([therapist], monday2025);
    expect(result.length).toBeGreaterThan(0);
    const firstBlock = result[0];
    const startHour = new Date(firstBlock.start).getHours();
    expect(startHour).toBeGreaterThanOrEqual(7);
    expect(startHour).toBeLessThanOrEqual(9);
  });

  it("should_produce_blocks_for_weekdays_only", () => {
    const therapists = [createTherapist()];
    const result = generateScheduleBlocks(therapists, monday2025);
    const days = [...new Set(result.map((b) => b.start.slice(0, 10)))];
    expect(days.length).toBeLessThanOrEqual(5);
  });
});

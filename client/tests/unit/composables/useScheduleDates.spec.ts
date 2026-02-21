import { describe, it, expect } from "vitest";
import {
  isSameDay,
  formatHour,
  formatSlotLabel,
  formatDayName,
  formatTime,
  blockDurationMinutes,
  formatDuration,
  useScheduleDates,
} from "@/composables/useScheduleDates";

describe("useScheduleDates helpers", () => {
  describe("isSameDay", () => {
    it("should_return_true_when_same_date", () => {
      const d = new Date(2025, 1, 15);
      expect(isSameDay(d, new Date(2025, 1, 15))).toBe(true);
    });

    it("should_return_false_when_different_day", () => {
      const d1 = new Date(2025, 1, 15);
      const d2 = new Date(2025, 1, 16);
      expect(isSameDay(d1, d2)).toBe(false);
    });

    it("should_return_false_when_different_month", () => {
      const d1 = new Date(2025, 0, 15);
      const d2 = new Date(2025, 1, 15);
      expect(isSameDay(d1, d2)).toBe(false);
    });
  });

  describe("formatHour", () => {
    it("should_pad_single_digit_with_zero", () => {
      expect(formatHour(0)).toBe("00:00");
      expect(formatHour(9)).toBe("09:00");
    });

    it("should_format_double_digit", () => {
      expect(formatHour(12)).toBe("12:00");
      expect(formatHour(23)).toBe("23:00");
    });
  });

  describe("formatSlotLabel", () => {
    it("should_format_integer_hour", () => {
      expect(formatSlotLabel(9)).toBe("09:00");
    });

    it("should_format_hour_with_minutes", () => {
      expect(formatSlotLabel(9.5)).toBe("09:30");
    });
  });

  describe("formatDayName", () => {
    it("should_return_weekday_name_in_spanish", () => {
      const monday = new Date(2025, 1, 3);
      expect(formatDayName(monday)).toBe("lunes");
    });
  });

  describe("formatTime", () => {
    it("should_format_iso_string_as_time", () => {
      const formatted = formatTime("2025-02-03T14:30:00.000Z");
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("blockDurationMinutes", () => {
    it("should_return_60_for_one_hour_span", () => {
      const start = "2025-02-03T09:00:00.000Z";
      const end = "2025-02-03T10:00:00.000Z";
      expect(blockDurationMinutes(start, end)).toBe(60);
    });

    it("should_return_90_for_hour_and_half", () => {
      const start = "2025-02-03T09:00:00.000Z";
      const end = "2025-02-03T10:30:00.000Z";
      expect(blockDurationMinutes(start, end)).toBe(90);
    });
  });

  describe("formatDuration", () => {
    it("should_return_minutes_only_when_under_60", () => {
      const start = "2025-02-03T09:00:00.000Z";
      const end = "2025-02-03T09:30:00.000Z";
      expect(formatDuration(start, end)).toBe("30 min");
    });

    it("should_return_hours_when_exact", () => {
      const start = "2025-02-03T09:00:00.000Z";
      const end = "2025-02-03T11:00:00.000Z";
      expect(formatDuration(start, end)).toBe("2 h");
    });

    it("should_return_hours_and_minutes_when_mixed", () => {
      const start = "2025-02-03T09:00:00.000Z";
      const end = "2025-02-03T10:30:00.000Z";
      expect(formatDuration(start, end)).toBe("1 h 30 min");
    });
  });

  describe("useScheduleDates", () => {
    it("should_return_object_with_all_date_helpers", () => {
      const api = useScheduleDates();
      expect(api.isSameDay).toBe(isSameDay);
      expect(api.isToday).toBeDefined();
      expect(api.formatHour).toBe(formatHour);
      expect(api.formatSlotLabel).toBe(formatSlotLabel);
      expect(api.formatDayName).toBe(formatDayName);
      expect(api.formatTime).toBe(formatTime);
      expect(api.blockDurationMinutes).toBe(blockDurationMinutes);
      expect(api.formatDuration).toBe(formatDuration);
    });
  });
});

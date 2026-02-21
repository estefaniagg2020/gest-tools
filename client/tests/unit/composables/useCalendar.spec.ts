import { describe, it, expect } from "vitest";
import { useCalendar, VIEW_DAY, VIEW_WEEK, VIEW_MONTH } from "@/composables/useCalendar";

describe("useCalendar", () => {
  it("should_export_view_constants", () => {
    expect(VIEW_DAY).toBe("day");
    expect(VIEW_WEEK).toBe("week");
    expect(VIEW_MONTH).toBe("month");
  });

  it("should_return_startOfWeek_as_monday", () => {
    const { currentDate, startOfWeek } = useCalendar();
    currentDate.value = new Date(2025, 1, 5);
    const start = startOfWeek.value;
    expect(start.getDay()).toBe(1);
  });

  it("should_return_weekDays_with_length_7", () => {
    const { currentDate, weekDays } = useCalendar();
    currentDate.value = new Date(2025, 1, 5);
    expect(weekDays.value).toHaveLength(7);
  });

  it("should_return_monthDays_for_current_month", () => {
    const { currentDate, monthDays } = useCalendar();
    currentDate.value = new Date(2025, 0, 15);
    const days = monthDays.value;
    expect(days.length).toBeGreaterThan(0);
    expect(days.every((d) => d.getMonth() === 0 || d.getMonth() === 11 || d.getMonth() === 1)).toBe(true);
  });

  it("should_advance_by_day_when_view_is_day", () => {
    const { currentDate, view, next } = useCalendar();
    view.value = VIEW_DAY;
    currentDate.value = new Date(2025, 1, 10);
    next();
    expect(currentDate.value.getDate()).toBe(11);
  });

  it("should_advance_by_week_when_view_is_week", () => {
    const { currentDate, view, next } = useCalendar();
    view.value = VIEW_WEEK;
    currentDate.value = new Date(2025, 1, 10);
    const before = currentDate.value.getDate();
    next();
    expect(currentDate.value.getDate()).toBe(before + 7);
  });

  it("should_go_back_with_prev", () => {
    const { currentDate, view, prev } = useCalendar();
    view.value = VIEW_DAY;
    currentDate.value = new Date(2025, 1, 10);
    prev();
    expect(currentDate.value.getDate()).toBe(9);
  });

  it("should_format_date_with_spanish_locale", () => {
    const { formatDate } = useCalendar();
    const d = new Date(2025, 0, 15);
    const formatted = formatDate(d);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe("string");
  });
});

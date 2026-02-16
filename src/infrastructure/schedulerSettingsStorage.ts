import type { SchedulerViewSettings } from "@/interfaces";

const KEY = "spa-scheduler-view-settings";

const VALID_SLOT_DURATIONS = [30, 60, 90, 120] as const;

const DEFAULT_WORK_DAYS = 5;
const DEFAULT_MAX_PEOPLE = 1;
const VALID_VIEWS = ["day", "week", "month"] as const;

function normalizeStored(parsed: Record<string, unknown>): SchedulerViewSettings | null {
  const startHour = typeof parsed.startHour === "number" ? parsed.startHour : null;
  const endHour = typeof parsed.endHour === "number" ? parsed.endHour : null;
  const pixelsPerHour = typeof parsed.pixelsPerHour === "number" ? parsed.pixelsPerHour : null;
  const slotDurationMinutes =
    typeof parsed.slotDurationMinutes === "number" &&
    VALID_SLOT_DURATIONS.includes(parsed.slotDurationMinutes as 30 | 60 | 90 | 120)
      ? (parsed.slotDurationMinutes as 30 | 60 | 90 | 120)
      : 60;
  const workDaysPerWeek =
    typeof parsed.workDaysPerWeek === "number" && parsed.workDaysPerWeek >= 1 && parsed.workDaysPerWeek <= 7
      ? Math.floor(parsed.workDaysPerWeek)
      : DEFAULT_WORK_DAYS;
  const maxPeoplePerSlot =
    typeof parsed.maxPeoplePerSlot === "number" && parsed.maxPeoplePerSlot >= 1 && parsed.maxPeoplePerSlot <= 20
      ? Math.floor(parsed.maxPeoplePerSlot)
      : DEFAULT_MAX_PEOPLE;
  const defaultView =
    typeof parsed.defaultView === "string" && VALID_VIEWS.includes(parsed.defaultView as "day" | "week" | "month")
      ? (parsed.defaultView as "day" | "week" | "month")
      : "week";
  if (startHour === null || endHour === null || pixelsPerHour === null) return null;
  return {
    startHour,
    endHour,
    pixelsPerHour,
    slotDurationMinutes,
    workDaysPerWeek,
    maxPeoplePerSlot,
    defaultView,
  };
}

export function loadSchedulerSettings(): SchedulerViewSettings | null {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "startHour" in parsed &&
      "endHour" in parsed &&
      "pixelsPerHour" in parsed
    ) {
      return normalizeStored(parsed as Record<string, unknown>);
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSchedulerSettings(settings: SchedulerViewSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

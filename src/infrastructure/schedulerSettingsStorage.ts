import type { SchedulerViewSettings } from "@/interfaces";

const KEY = "spa-scheduler-view-settings";

const VALID_SLOT_DURATIONS = [30, 60, 90, 120] as const;

function normalizeStored(parsed: Record<string, unknown>): SchedulerViewSettings | null {
  const startHour = typeof parsed.startHour === "number" ? parsed.startHour : null;
  const endHour = typeof parsed.endHour === "number" ? parsed.endHour : null;
  const pixelsPerHour = typeof parsed.pixelsPerHour === "number" ? parsed.pixelsPerHour : null;
  const slotDurationMinutes =
    typeof parsed.slotDurationMinutes === "number" &&
    VALID_SLOT_DURATIONS.includes(parsed.slotDurationMinutes as 30 | 60 | 90 | 120)
      ? (parsed.slotDurationMinutes as 30 | 60 | 90 | 120)
      : 60;
  if (startHour === null || endHour === null || pixelsPerHour === null) return null;
  return {
    startHour,
    endHour,
    pixelsPerHour,
    slotDurationMinutes,
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

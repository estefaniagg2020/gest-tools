import type { SlotDurationMinutes } from "@/interfaces";
import { SCHEDULE_VIEW_SETTINGS } from "@/data/constants";

export const MIN_HOUR = 0;
export const MAX_HOUR = 24;
export const MIN_PIXELS = 30;
export const MAX_PIXELS = 200;
const MIN_WORK_DAYS = 1;
const MAX_WORK_DAYS = 7;

const VALID_SLOT_DURATIONS: SlotDurationMinutes[] = [30, 60, 90, 120];

export const clampHour = (h: number): number => Math.max(MIN_HOUR, Math.min(MAX_HOUR, Math.floor(h)));

export const clampPixels = (p: number): number => Math.max(MIN_PIXELS, Math.min(MAX_PIXELS, Math.floor(p)));

export const clampSlotDuration = (m: number): SlotDurationMinutes => {
  const valid = VALID_SLOT_DURATIONS.find((d) => d === m);
  return valid ?? (SCHEDULE_VIEW_SETTINGS.DEFAULT_SLOT_DURATION as SlotDurationMinutes);
};

export const clampWorkDaysPerWeek = (d: number): number =>
  Math.max(MIN_WORK_DAYS, Math.min(MAX_WORK_DAYS, Math.floor(d)));

export const clampMaxPeoplePerSlot = (n: number): number =>
  Math.max(
    SCHEDULE_VIEW_SETTINGS.MAX_PEOPLE_PER_SLOT_MIN,
    Math.min(SCHEDULE_VIEW_SETTINGS.MAX_PEOPLE_PER_SLOT_MAX, Math.floor(n)),
  );

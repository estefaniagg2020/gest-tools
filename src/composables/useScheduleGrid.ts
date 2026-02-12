import { computed, type MaybeRefOrGetter, toValue, type ComputedRef } from "vue";
import { formatSlotLabel } from "./useScheduleDates";

const slotDurationToHourFraction = (minutes: number) => minutes / 60;

export const useScheduleGrid = (
  startHour: MaybeRefOrGetter<number>,
  endHour: MaybeRefOrGetter<number>,
  pixelsPerHour: MaybeRefOrGetter<number>,
  slotDurationMinutes: MaybeRefOrGetter<number> = () => 60,
): {
  slotStarts: ComputedRef<number[]>;
  totalHeight: ComputedRef<number>;
  formatSlotLabel: (hour: number) => string;
  getSlotStartFromClick: (event: MouseEvent, topOffsetPx?: number) => number | null;
} => {
  const slotStarts = computed(() => {
    const start = toValue(startHour);
    const end = toValue(endHour);
    const slotMins = toValue(slotDurationMinutes);
    const step = slotDurationToHourFraction(slotMins);
    const slots: number[] = [];
    for (let h = start; h < end; h += step) {
      slots.push(Math.round(h * 100) / 100);
    }
    return slots;
  });

  const totalHeight = computed(() => {
    const start = toValue(startHour);
    const end = toValue(endHour);
    const pixels = toValue(pixelsPerHour);
    return (end - start) * pixels;
  });

  const getSlotStartFromClick = (event: MouseEvent, topOffsetPx = 0): number | null => {
    const start = toValue(startHour);
    const end = toValue(endHour);
    const pixels = toValue(pixelsPerHour);
    const slotMins = toValue(slotDurationMinutes);
    const step = slotDurationToHourFraction(slotMins);
    const clickY = event.offsetY - topOffsetPx;
    const hourOffset = clickY / pixels;
    const slotIndex = Math.floor(hourOffset / step);
    const slotStart = start + slotIndex * step;
    if (slotStart >= start && slotStart < end) return Math.round(slotStart * 100) / 100;
    return null;
  };

  return {
    slotStarts,
    totalHeight,
    formatSlotLabel,
    getSlotStartFromClick,
  };
};

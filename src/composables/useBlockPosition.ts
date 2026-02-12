import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { ScheduleBlock } from "@/interfaces";

const getMinutesFromMidnight = (dateStr: string): number => {
  const d = new Date(dateStr);
  return d.getHours() * 60 + d.getMinutes();
};

const SMALL_HEIGHT_THRESHOLD = 40;

export const useBlockPosition = (
  block: MaybeRefOrGetter<ScheduleBlock>,
  startHour: MaybeRefOrGetter<number>,
  pixelsPerHour: MaybeRefOrGetter<number>,
  topOffset: MaybeRefOrGetter<number> = () => 0,
) => {
  const top = computed(() => {
    const b = toValue(block);
    const start = toValue(startHour);
    const pixels = toValue(pixelsPerHour);
    const startMinutes = getMinutesFromMidnight(b.start);
    const offsetMinutes = startMinutes - start * 60;
    return (offsetMinutes / 60) * pixels;
  });

  const height = computed(() => {
    const b = toValue(block);
    const pixels = toValue(pixelsPerHour);
    const startMinutes = getMinutesFromMidnight(b.start);
    const endMinutes = getMinutesFromMidnight(b.end);
    const duration = endMinutes - startMinutes;
    return (duration / 60) * pixels;
  });

  const cardStyle = computed(() => {
    const offset = toValue(topOffset);
    return {
      top: `${top.value + offset}px`,
      height: `${height.value}px`,
    };
  });

  const isSmall = computed(() => height.value < SMALL_HEIGHT_THRESHOLD);

  return { top, height, cardStyle, isSmall };
};

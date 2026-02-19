import { computed, type MaybeRefOrGetter, toValue } from "vue";

interface WithStartEnd {
  start: string;
  end: string;
}

const getMinutesFromMidnight = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getHours() * 60 + date.getMinutes();
};

const SMALL_HEIGHT_THRESHOLD = 28;

export const useBlockPosition = (
  block: MaybeRefOrGetter<WithStartEnd>,
  startHour: MaybeRefOrGetter<number>,
  pixelsPerHour: MaybeRefOrGetter<number>,
  topOffset: MaybeRefOrGetter<number> = () => 0,
) => {
  const top = computed(() => {
    const blockVal = toValue(block);
    const start = toValue(startHour);
    const pixels = toValue(pixelsPerHour);
    const startMinutes = getMinutesFromMidnight(blockVal.start);
    const offsetMinutes = startMinutes - start * 60;
    return (offsetMinutes / 60) * pixels;
  });

  const height = computed(() => {
    const blockVal = toValue(block);
    const pixels = toValue(pixelsPerHour);
    const startMinutes = getMinutesFromMidnight(blockVal.start);
    const endMinutes = getMinutesFromMidnight(blockVal.end);
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

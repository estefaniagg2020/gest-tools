import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import { isSameDay } from "./useScheduleDates";
import { filterBlocksByDay } from "./useScheduleBlocks";

export interface MonthGridDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  blocks: ScheduleBlock[];
}

const CELLS_COUNT = 42;

export const useMonthGrid = (currentDate: MaybeRefOrGetter<Date>, blocks: MaybeRefOrGetter<ScheduleBlock[]>) => {
  const days = computed<MonthGridDay[]>(() => {
    const date = toValue(currentDate);
    const blocksList = toValue(blocks);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - diff);

    const result: MonthGridDay[] = [];
    const current = new Date(startDate);
    const today = new Date();

    for (let i = 0; i < CELLS_COUNT; i++) {
      const d = new Date(current);
      const isCurrentMonth = d.getMonth() === month;
      const dayBlocks = filterBlocksByDay(blocksList, d).sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
      result.push({
        date: d,
        isCurrentMonth,
        isToday: isSameDay(d, today),
        blocks: dayBlocks,
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  });

  return { days };
};

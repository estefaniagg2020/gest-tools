import type { ScheduleBlock } from "@/interfaces";
import { isSameDay } from "./useScheduleDates";

export const filterBlocksByDay = (blocks: ScheduleBlock[], date: Date): ScheduleBlock[] =>
  blocks.filter((block) => {
    const blockDate = new Date(block.start);
    return isSameDay(blockDate, date);
  });

export const filterBlocksByDayAndTherapist = (
  blocks: ScheduleBlock[],
  date: Date,
  therapistId: string,
): ScheduleBlock[] =>
  blocks.filter((block) => {
    const blockDate = new Date(block.start);
    return isSameDay(blockDate, date) && block.therapistId === therapistId;
  });

export const useScheduleBlocks = () => ({
  filterBlocksByDay,
  filterBlocksByDayAndTherapist,
});

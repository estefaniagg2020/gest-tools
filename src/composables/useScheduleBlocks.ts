import type { ScheduleBlock, AgendaItem } from "@/interfaces";
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

const getItemStart = (item: AgendaItem) => item.start;
const getItemTherapistId = (item: AgendaItem) => item.therapistId;

export const filterAgendaItemsByDay = (items: AgendaItem[], date: Date): AgendaItem[] =>
  items.filter((item) => {
    const itemDate = new Date(getItemStart(item));
    return isSameDay(itemDate, date);
  });

export const filterAgendaItemsByDayAndTherapist = (
  items: AgendaItem[],
  date: Date,
  therapistId: string,
): AgendaItem[] =>
  items.filter((item) => {
    const itemDate = new Date(getItemStart(item));
    return isSameDay(itemDate, date) && getItemTherapistId(item) === therapistId;
  });

export const useScheduleBlocks = () => ({
  filterBlocksByDay,
  filterBlocksByDayAndTherapist,
  filterAgendaItemsByDay,
  filterAgendaItemsByDayAndTherapist,
});

import type { ScheduleBlock, AgendaItem } from "@/interfaces";
import { isSameDay } from "./useScheduleDates";

export const filterBlocksByDay = (blocks: ScheduleBlock[], date: Date): ScheduleBlock[] =>
  blocks.filter((block) => {
    const blockDate = new Date(block.start);
    return isSameDay(blockDate, date);
  });

export const filterBlocksByDayAndMember = (
  blocks: ScheduleBlock[],
  date: Date,
  memberId: string,
): ScheduleBlock[] =>
  blocks.filter((block) => {
    const blockDate = new Date(block.start);
    return isSameDay(blockDate, date) && block.memberId === memberId;
  });

const getItemStart = (item: AgendaItem) => item.start;
const getItemMemberId = (item: AgendaItem): string =>
  "memberId" in item ? (item.memberId ?? "") : (item as ScheduleBlock).memberId;

export const filterAgendaItemsByDay = (items: AgendaItem[], date: Date): AgendaItem[] =>
  items.filter((item) => {
    const itemDate = new Date(getItemStart(item));
    return isSameDay(itemDate, date);
  });

export const filterAgendaItemsByDayAndMember = (
  items: AgendaItem[],
  date: Date,
  memberId: string,
): AgendaItem[] =>
  items.filter((item) => {
    const itemDate = new Date(getItemStart(item));
    return isSameDay(itemDate, date) && getItemMemberId(item) === memberId;
  });

export const useScheduleBlocks = () => ({
  filterBlocksByDay,
  filterBlocksByDayAndMember,
  filterAgendaItemsByDay,
  filterAgendaItemsByDayAndMember,
});

import type { ScheduleBlockType } from "@/interfaces";

export interface BlockTypeCardStyle {
  bg: string;
  border: string;
  text: string;
}

const DEFAULT_STYLE: BlockTypeCardStyle = {
  bg: "bg-gray-100 dark:bg-gray-500/20",
  border: "border-gray-500 dark:border-gray-400",
  text: "text-gray-700 dark:text-gray-100",
};

export const BLOCK_TYPE_CARD_STYLES: Record<ScheduleBlockType, BlockTypeCardStyle> = {
  work: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    border: "border-blue-500 dark:border-blue-400",
    text: "text-blue-800 dark:text-blue-100",
  },
  vacation: {
    bg: "bg-orange-100 dark:bg-orange-500/20",
    border: "border-orange-500 dark:border-orange-400",
    text: "text-orange-800 dark:text-orange-100",
  },
  training: {
    bg: "bg-violet-100 dark:bg-violet-500/20",
    border: "border-violet-500 dark:border-violet-400",
    text: "text-violet-800 dark:text-violet-100",
  },
  admin: {
    bg: "bg-slate-100 dark:bg-slate-500/20",
    border: "border-slate-400 dark:border-slate-400",
    text: "text-slate-600 dark:text-slate-100",
  },
  other: DEFAULT_STYLE,
};

export const getBlockTypeCardStyle = (type: ScheduleBlockType): BlockTypeCardStyle =>
  BLOCK_TYPE_CARD_STYLES[type] ?? DEFAULT_STYLE;

export const BLOCK_TYPE_MONTH_CELL_CLASSES: Record<ScheduleBlockType, string> = {
  work: "bg-[#017074] text-white dark:bg-[#017074]/70",
  vacation: "bg-[#db7f50] text-white dark:bg-[#db7f50]/70",
  training: "bg-[#7f8563] text-white dark:bg-[#7f8563]/70",
  admin: "bg-[#f6c8ae] text-[#8c5e3c] dark:bg-[#f6c8ae]/70 dark:text-white",
  other: "bg-gray-400 text-white dark:bg-gray-500/70",
};

export const getBlockTypeMonthCellClass = (type: ScheduleBlockType): string =>
  BLOCK_TYPE_MONTH_CELL_CLASSES[type] ?? "bg-gray-400 text-white";

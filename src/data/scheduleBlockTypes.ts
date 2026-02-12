import type { ScheduleBlockType } from "@/interfaces";

export interface BlockTypeCardStyle {
  bg: string;
  border: string;
  text: string;
}

const DEFAULT_STYLE: BlockTypeCardStyle = {
  bg: "bg-gray-100",
  border: "border-gray-500",
  text: "text-gray-700",
};

export const BLOCK_TYPE_CARD_STYLES: Record<ScheduleBlockType, BlockTypeCardStyle> = {
  work: { bg: "bg-spa-teal/10", border: "border-spa-teal", text: "text-spa-teal" },
  vacation: { bg: "bg-spa-primary/10", border: "border-spa-primary", text: "text-spa-primary" },
  training: { bg: "bg-spa-olive/10", border: "border-spa-olive", text: "text-spa-olive" },
  admin: { bg: "bg-spa-peach/20", border: "border-spa-peach", text: "text-gray-700" },
  other: DEFAULT_STYLE,
};

export const getBlockTypeCardStyle = (type: ScheduleBlockType): BlockTypeCardStyle =>
  BLOCK_TYPE_CARD_STYLES[type] ?? DEFAULT_STYLE;

export const BLOCK_TYPE_MONTH_CELL_CLASSES: Record<ScheduleBlockType, string> = {
  work: "bg-[#017074] text-white",
  vacation: "bg-[#db7f50] text-white",
  training: "bg-[#7f8563] text-white",
  admin: "bg-[#f6c8ae] text-[#8c5e3c]",
  other: "bg-gray-400 text-white",
};

export const getBlockTypeMonthCellClass = (type: ScheduleBlockType): string =>
  BLOCK_TYPE_MONTH_CELL_CLASSES[type] ?? "bg-gray-400 text-white";

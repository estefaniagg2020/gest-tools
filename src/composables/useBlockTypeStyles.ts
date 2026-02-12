import type { ScheduleBlockType } from "@/interfaces";
import { getBlockTypeCardStyle } from "@/data/scheduleBlockTypes";

export const getBlockTypeCardStyles = (type: ScheduleBlockType) => getBlockTypeCardStyle(type);

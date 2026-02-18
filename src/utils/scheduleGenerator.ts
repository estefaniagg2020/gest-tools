import type { ScheduleBlock, TeamMember } from "@/interfaces";
import { useScheduleStore } from "../stores/schedule";

const DEFAULT_START = 9;
const DEFAULT_END = 18;
const WEEKDAYS = 5;

const BLOCK_TYPE_WORK = "work" as const;
const BLOCK_TYPE_VACATION = "vacation" as const;
const BLOCK_TYPE_ADMIN = "admin" as const;

const TITLE_MORNING = "Mañana";
const TITLE_AFTERNOON = "Tarde";
const TITLE_FULL_DAY = "Jornada Continua";
const TITLE_DAY_OFF = "Día Libre";
const TITLE_MEETING = "Reunión";
const DESC_DAY_OFF = "Descanso personal";

const getWorkHours = (m: TeamMember) => ({
  start: m.defaultWorkStartHour ?? DEFAULT_START,
  end: m.defaultWorkEndHour ?? DEFAULT_END,
});

const getStartOfWeek = (baseDate: Date): Date => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const setTime = (date: Date, h: number, m: number): string => {
  const d = new Date(date);
  d.setHours(h, m, 0);
  return d.toISOString();
};

type BlockInput = Omit<ScheduleBlock, "id">;

const createBlock = (
  memberId: string,
  day: Date,
  startH: number,
  endH: number,
  type: ScheduleBlock["type"],
  title: string,
  description?: string,
  startM = 0,
  endM = 0,
): BlockInput => ({
  memberId,
  start: setTime(day, startH, startM),
  end: setTime(day, endH, endM),
  type,
  title,
  ...(description ? { description } : {}),
});

const roll = (p: number): boolean => Math.random() < p;

const vacationBlocksForDay = (memberId: string, day: Date, startH: number, endH: number): BlockInput[] => {
  return [createBlock(memberId, day, startH, endH, BLOCK_TYPE_VACATION, TITLE_DAY_OFF, DESC_DAY_OFF)];
};

const workBlocksForDay = (
  memberId: string,
  day: Date,
  startH: number,
  endH: number,
  weeklyHours: number,
): BlockInput[] => {
  const midH = startH + Math.floor((endH - startH) / 2);
  const halfSpan = Math.max(1, Math.floor((endH - startH) * 0.4));

  if (weeklyHours >= 35) {
    const splitDay = roll(0.5);
    if (splitDay) {
      return [
        createBlock(memberId, day, startH, midH, BLOCK_TYPE_WORK, TITLE_MORNING, undefined, 0, 30),
        createBlock(memberId, day, midH + 1, endH, BLOCK_TYPE_WORK, TITLE_AFTERNOON, undefined, 0, 30),
      ];
    }
    return [createBlock(memberId, day, startH, endH, BLOCK_TYPE_WORK, TITLE_FULL_DAY)];
  }

  const isMorning = roll(0.5);
  if (isMorning) {
    return [createBlock(memberId, day, startH, startH + halfSpan, BLOCK_TYPE_WORK, TITLE_MORNING)];
  }
  return [createBlock(memberId, day, endH - halfSpan, endH, BLOCK_TYPE_WORK, TITLE_AFTERNOON)];
};

const optionalAdminBlockForDay = (memberId: string, day: Date, startH: number): BlockInput | null => {
  if (!roll(0.1)) return null;
  return createBlock(memberId, day, Math.max(0, startH - 1), startH, BLOCK_TYPE_ADMIN, TITLE_MEETING);
};

const blocksForDay = (
  member: TeamMember,
  dayIndex: number,
  startOfWeek: Date,
  workHours: { start: number; end: number },
): BlockInput[] => {
  const day = new Date(startOfWeek);
  day.setDate(startOfWeek.getDate() + dayIndex);

  const { start: startH, end: endH } = workHours;

  if (roll(0.05)) {
    return vacationBlocksForDay(member.id, day, startH, endH);
  }

  const work = workBlocksForDay(member.id, day, startH, endH, member.weeklyHours);
  const admin = optionalAdminBlockForDay(member.id, day, startH);
  return admin ? [admin, ...work] : work;
};

const blocksForMember = (member: TeamMember, startOfWeek: Date): BlockInput[] => {
  const workHours = getWorkHours(member);
  const result: BlockInput[] = [];
  for (let i = 0; i < WEEKDAYS; i++) {
    result.push(...blocksForDay(member, i, startOfWeek, workHours));
  }
  return result;
};

export const generateScheduleBlocks = (members: TeamMember[], baseDate: Date = new Date()): BlockInput[] => {
  const startOfWeek = getStartOfWeek(baseDate);
  return members.flatMap((m) => blocksForMember(m, startOfWeek));
};

export const generateAllSchedules = (members: TeamMember[], baseDate: Date = new Date()): void => {
  const store = useScheduleStore();
  const blocks = generateScheduleBlocks(members, baseDate);
  blocks.forEach((block) => store.addBlock(block));
};

import { computed } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import type { Appointment } from "@/interfaces";
import type { TeamMember } from "@/interfaces/team";
import { slotOverlapsExisting } from "./useScheduleOverlap";
import { formatSlotLabel } from "./useScheduleDates";

export interface AvailableSlot {
  date: Date;
  startHour: number;
  endHour: number;
  memberId: string;
  memberName: string;
}

export interface TimeWindow {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

const hourToTimeStr = (h: number): string => {
  const hi = Math.floor(h);
  const mi = Math.round((h - hi) * 60);
  return `${String(hi).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
};

const getWindowsForDay = (
  timeWindows: TimeWindow[],
  dayOfWeek: number,
): Array<{ startHour: number; endHour: number }> => {
  return timeWindows
    .filter((w) => w.dayOfWeek === dayOfWeek && w.endHour > w.startHour)
    .map((w) => ({ startHour: w.startHour, endHour: w.endHour }));
};

export interface FindSlotsParams {
  fromDate: Date;
  toDate: Date;
  durationMinutes: number;
  members: TeamMember[];
  blocks: ScheduleBlock[];
  appointments: Appointment[];
  timeWindows: TimeWindow[];
  slotDurationMinutes: number;
}

export const findAvailableSlots = (params: FindSlotsParams): AvailableSlot[] => {
  const {
    fromDate,
    toDate,
    durationMinutes,
    members,
    blocks,
    appointments,
    timeWindows,
    slotDurationMinutes,
  } = params;

  const durationHours = durationMinutes / 60;
  const stepMinutes = Math.min(slotDurationMinutes, durationMinutes);
  const stepHours = stepMinutes / 60;
  const slots: AvailableSlot[] = [];
  const activeBlocks = blocks.filter((b) => b.status !== "cancelled");
  const activeAppointments = appointments.filter((a) => a.status !== "cancelled");

  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(toDate);
  to.setHours(0, 0, 0, 0);

  const day = new Date(from);
  while (day <= to) {
    const dayOfWeek = day.getDay();
    const windows = getWindowsForDay(timeWindows, dayOfWeek);

    for (const window of windows) {
      for (const member of members) {
        for (
          let h = window.startHour;
          h + durationHours <= window.endHour;
          h += stepHours
        ) {
          const startTime = hourToTimeStr(h);
          const endTime = hourToTimeStr(h + durationHours);
          const overlaps = slotOverlapsExisting({
            blocks: activeBlocks,
            appointments: activeAppointments,
            memberId: member.id,
            date: day,
            startTime,
            endTime,
          });
          if (!overlaps) {
            slots.push({
              date: new Date(day),
              startHour: h,
              endHour: h + durationHours,
              memberId: member.id,
              memberName: member.name,
            });
          }
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }

  return slots;
};

export interface UseSlotFinderParams {
  fromDate: () => Date;
  toDate: () => Date;
  durationMinutes: () => number;
  members: () => TeamMember[];
  blocks: () => ScheduleBlock[];
  appointments: () => Appointment[];
  timeWindows: () => TimeWindow[];
  slotDurationMinutes: () => number;
}

export const useSlotFinder = (params: UseSlotFinderParams) => {
  const availableSlots = computed<AvailableSlot[]>(() =>
    findAvailableSlots({
      fromDate: params.fromDate(),
      toDate: params.toDate(),
      durationMinutes: params.durationMinutes(),
      members: params.members(),
      blocks: params.blocks(),
      appointments: params.appointments(),
      timeWindows: params.timeWindows(),
      slotDurationMinutes: params.slotDurationMinutes(),
    }),
  );

  const formatSlotForDisplay = (slot: AvailableSlot) =>
    `${formatSlotLabel(slot.startHour)} - ${formatSlotLabel(slot.endHour)}`;

  return { availableSlots, formatSlotForDisplay };
};

import type { ScheduleBlock } from "@/interfaces";
import type { Appointment } from "@/interfaces";
import { isSameDay } from "./useScheduleDates";

const rangesOverlap = (startA: number, endA: number, startB: number, endB: number): boolean =>
  startA < endB && endA > startB;

const toMinutesFromEpoch = (iso: string): number => new Date(iso).getTime() / 60_000;

export interface OverlapCheckParams {
  blocks: ScheduleBlock[];
  appointments: Appointment[];
  memberId: string;
  date: Date;
  startTime: string;
  endTime: string;
  excludeBlockId?: string;
  excludeAppointmentId?: string;
}

const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const slotOverlapsExisting = (params: OverlapCheckParams): boolean => {
  const {
    blocks,
    appointments,
    memberId,
    date,
    startTime,
    endTime,
    excludeBlockId,
    excludeAppointmentId,
  } = params;
  const dateStr = toDateStr(date);
  const startA = toMinutesFromEpoch(`${dateStr}T${startTime}:00`);
  const endA = toMinutesFromEpoch(`${dateStr}T${endTime}:00`);

  const blockOverlaps = (b: ScheduleBlock): boolean => {
    if (excludeBlockId && b.id === excludeBlockId) return false;
    if (b.memberId !== memberId) return false;
    if (!isSameDay(new Date(b.start), date)) return false;
    const startB = toMinutesFromEpoch(b.start);
    const endB = toMinutesFromEpoch(b.end);
    return rangesOverlap(startA, endA, startB, endB);
  };

  const appointmentOverlaps = (a: Appointment): boolean => {
    if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
    const mid = a.memberId ?? "";
    if (mid !== memberId) return false;
    if (!isSameDay(new Date(a.start), date)) return false;
    if (a.status === "cancelled") return false;
    const startB = toMinutesFromEpoch(a.start);
    const endB = toMinutesFromEpoch(a.end);
    return rangesOverlap(startA, endA, startB, endB);
  };

  const blockHasOverlap = blocks.some(blockOverlaps);
  const appointmentHasOverlap = appointments.some(appointmentOverlaps);
  return blockHasOverlap || appointmentHasOverlap;
};

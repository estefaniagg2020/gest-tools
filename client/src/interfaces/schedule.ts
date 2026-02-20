export type ScheduleBlockType = "work" | "vacation" | "training" | "admin" | "other";

export interface ScheduleBlock {
  id: string;
  memberId: string;
  start: string;
  end: string;
  type: ScheduleBlockType;
  title: string;
  description?: string;
  status?: "confirmed" | "pending" | "cancelled";
  serviceId?: string;
}

export interface RejectedRequestSnapshot {
  title: string;
  start: string;
  end: string;
  type: ScheduleBlockType;
  description?: string;
}

export interface RejectedRequest {
  id: string;
  memberId: string;
  blockSnapshot: RejectedRequestSnapshot;
  rejectedAt: string;
}

export interface ViewOption {
  value: "day" | "week" | "month";
  label: string;
}

export type SlotDurationMinutes = 30 | 60 | 90 | 120;

export type DefaultViewType = "day" | "week" | "month";

export type WeekStartOption = "locale" | "monday" | "sunday";

export interface SchedulerViewSettings {
  startHour: number;
  endHour: number;
  pixelsPerHour: number;
  slotDurationMinutes: SlotDurationMinutes;
  workDaysPerWeek: number;
  maxPeoplePerSlot: number;
  defaultView?: DefaultViewType;
  weekStart?: WeekStartOption;
}

export type AgendaItem = ScheduleBlock | import("./appointment").Appointment;

export const isScheduleBlock = (
  item: AgendaItem,
): item is ScheduleBlock => "type" in item;

export const isAppointment = (
  item: AgendaItem,
): item is import("./appointment").Appointment => !("type" in item);

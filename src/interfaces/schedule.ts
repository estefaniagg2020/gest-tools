export type ScheduleBlockType = "work" | "vacation" | "training" | "admin" | "other";

export interface ScheduleBlock {
  id: string;
  therapistId: string;
  start: string;
  end: string;
  type: ScheduleBlockType;
  title: string;
  description?: string;
  status?: "confirmed" | "pending";
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
  therapistId: string;
  blockSnapshot: RejectedRequestSnapshot;
  rejectedAt: string;
}

export interface ViewOption {
  value: "day" | "week" | "month";
  label: string;
}

export type SlotDurationMinutes = 30 | 60 | 90 | 120;

export interface SchedulerViewSettings {
  startHour: number;
  endHour: number;
  pixelsPerHour: number;
  slotDurationMinutes: SlotDurationMinutes;
}

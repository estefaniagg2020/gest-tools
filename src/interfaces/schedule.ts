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
  /** Servicio asociado (opcional), p. ej. para bloques de tipo work. */
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
  therapistId: string;
  blockSnapshot: RejectedRequestSnapshot;
  rejectedAt: string;
}

export interface ViewOption {
  value: "day" | "week" | "month";
  label: string;
}

export type SlotDurationMinutes = 30 | 60 | 90 | 120;

export type DefaultViewType = "day" | "week" | "month";

export interface SchedulerViewSettings {
  startHour: number;
  endHour: number;
  pixelsPerHour: number;
  slotDurationMinutes: SlotDurationMinutes;
  workDaysPerWeek: number;
  maxPeoplePerSlot: number;
  defaultView?: DefaultViewType;
}

export type AgendaItem = ScheduleBlock | import("./appointment").Appointment;

export const isScheduleBlock = (
  item: AgendaItem,
): item is ScheduleBlock => !("clientId" in item);

export const isAppointment = (
  item: AgendaItem,
): item is import("./appointment").Appointment => "clientId" in item;

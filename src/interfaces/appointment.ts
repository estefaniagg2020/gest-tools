export type AppointmentStatus = "confirmed" | "cancelled";

export interface Appointment {
  id: string;
  clientId?: string;
  serviceId?: string;
  memberId?: string;
  start: string;
  end: string;
  notes?: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
}

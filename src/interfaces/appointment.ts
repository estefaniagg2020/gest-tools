export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  therapistId: string;
  start: string;
  end: string;
  notes?: string;
}

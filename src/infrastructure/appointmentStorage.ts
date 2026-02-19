import type { Appointment } from "@/interfaces";

const KEY_LIST = "appointment-list";

export function loadStoredAppointments(): Appointment[] | null {
  const raw = localStorage.getItem(KEY_LIST);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAppointmentList(appointments: Appointment[]): void {
  localStorage.setItem(KEY_LIST, JSON.stringify(appointments));
}

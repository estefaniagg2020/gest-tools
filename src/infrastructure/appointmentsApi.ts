import { apiFetch } from "./apiClient";
import type { Appointment } from "@/interfaces";

export const appointmentsApi = {
  getAppointments: async (): Promise<Appointment[]> => {
    const res = await apiFetch("/api/appointments");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar citas");
    return Array.isArray(data) ? data : [];
  },

  createAppointment: async (payload: Omit<Appointment, "id">): Promise<Appointment> => {
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al crear cita");
    return data as Appointment;
  },

  updateAppointment: async (id: string, payload: Partial<Omit<Appointment, "id">>): Promise<Appointment> => {
    const res = await apiFetch(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar cita");
    return data as Appointment;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar cita");
    }
  },
};

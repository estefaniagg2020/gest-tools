import { defineStore } from "pinia";
import { ref } from "vue";
import type { Appointment } from "@/interfaces";
import { loadStoredAppointments, saveAppointmentList } from "@/infrastructure/appointmentStorage";

export const useAppointmentStore = defineStore("appointment", () => {
  const appointments = ref<Appointment[]>([]);

  const normalizeAppointment = (a: Record<string, unknown>): Appointment => {
    const memberId = a.memberId ?? a.therapistId;
    return { ...a, memberId } as Appointment;
  };

  const initialize = () => {
    const stored = loadStoredAppointments();
    const raw = stored ?? [];
    appointments.value = Array.isArray(raw)
      ? (raw as unknown as Record<string, unknown>[]).map(normalizeAppointment)
      : [];
    if (stored === null) {
      saveAppointmentList([]);
    }
  };

  const getById = (id: string) => appointments.value.find((a) => a.id === id);

  const getByMember = (memberId: string) =>
    appointments.value.filter((a) => a.memberId === memberId);

  const getByClient = (clientId: string) =>
    appointments.value.filter((a) => a.clientId === clientId);

  const add = (appointment: Omit<Appointment, "id">) => {
    const id = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newAppointment: Appointment = {
      ...appointment,
      id,
      status: appointment.status ?? "confirmed",
    };
    appointments.value.push(newAppointment);
    saveAppointmentList(appointments.value);
    return newAppointment;
  };

  const cancel = (id: string, reason?: string) => {
    update(id, { status: "cancelled", cancellationReason: reason ?? "" });
  };

  const update = (id: string, updates: Partial<Omit<Appointment, "id">>) => {
    const exists = appointments.value.some((a) => a.id === id);
    if (!exists) return;
    appointments.value = appointments.value.map((a) =>
      a.id === id ? { ...a, ...updates } : a,
    );
    saveAppointmentList(appointments.value);
  };

  const remove = (id: string) => {
    appointments.value = appointments.value.filter((a) => a.id !== id);
    saveAppointmentList(appointments.value);
  };

  const clearAll = () => {
    appointments.value = [];
    saveAppointmentList(appointments.value);
  };

  return {
    appointments,
    initialize,
    getById,
    getByMember,
    getByClient,
    add,
    update,
    remove,
    cancel,
    clearAll,
  };
});

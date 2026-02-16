import { defineStore } from "pinia";
import { ref } from "vue";
import type { Appointment } from "@/interfaces";
import { loadStoredAppointments, saveAppointmentList } from "@/infrastructure/appointmentStorage";

export const useAppointmentStore = defineStore("appointment", () => {
  const appointments = ref<Appointment[]>([]);

  const initialize = () => {
    appointments.value = loadStoredAppointments() ?? [];
  };

  const getById = (id: string) => appointments.value.find((a) => a.id === id);

  const getByTherapist = (therapistId: string) =>
    appointments.value.filter((a) => a.therapistId === therapistId);

  const getByClient = (clientId: string) =>
    appointments.value.filter((a) => a.clientId === clientId);

  const add = (appointment: Omit<Appointment, "id">) => {
    const id = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newAppointment: Appointment = { ...appointment, id };
    appointments.value.push(newAppointment);
    saveAppointmentList(appointments.value);
    return newAppointment;
  };

  const update = (id: string, updates: Partial<Omit<Appointment, "id">>) => {
    const index = appointments.value.findIndex((a) => a.id === id);
    if (index === -1) return;
    appointments.value[index] = { ...appointments.value[index], ...updates };
    saveAppointmentList(appointments.value);
  };

  const remove = (id: string) => {
    appointments.value = appointments.value.filter((a) => a.id !== id);
    saveAppointmentList(appointments.value);
  };

  return {
    appointments,
    initialize,
    getById,
    getByTherapist,
    getByClient,
    add,
    update,
    remove,
  };
});

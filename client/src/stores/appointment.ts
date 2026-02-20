import { defineStore } from "pinia";
import { ref } from "vue";
import type { Appointment } from "@/interfaces";
import { appointmentsApi } from "@/infrastructure/appointmentsApi";

export const useAppointmentStore = defineStore("appointment", () => {
  const appointments = ref<Appointment[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      appointments.value = await appointmentsApi.getAppointments();
    } catch {
      appointments.value = [];
    }
  };

  const getById = (id: string) => appointments.value.find((a) => a.id === id);

  const getByMember = (memberId: string) =>
    appointments.value.filter((a) => a.memberId === memberId);

  const getByClient = (clientId: string) =>
    appointments.value.filter((a) => a.clientId === clientId);

  const add = async (appointment: Omit<Appointment, "id">): Promise<Appointment> => {
    const created = await appointmentsApi.createAppointment({
      ...appointment,
      status: appointment.status ?? "pending",
      paymentStatus: appointment.paymentStatus ?? "pending",
    });
    appointments.value.push(created);
    return created;
  };

  const update = async (id: string, updates: Partial<Omit<Appointment, "id">>): Promise<void> => {
    const updated = await appointmentsApi.updateAppointment(id, updates);
    const index = appointments.value.findIndex((a) => a.id === id);
    if (index !== -1) appointments.value[index] = updated;
  };

  const cancel = async (id: string, reason?: string): Promise<void> => {
    await update(id, { status: "cancelled", cancellationReason: reason ?? "" });
  };

  const remove = async (id: string): Promise<void> => {
    await appointmentsApi.deleteAppointment(id);
    appointments.value = appointments.value.filter((a) => a.id !== id);
  };

  const clearAll = async (): Promise<void> => {
    for (const a of appointments.value) {
      try { await appointmentsApi.deleteAppointment(a.id); } catch { /* continue */ }
    }
    appointments.value = [];
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

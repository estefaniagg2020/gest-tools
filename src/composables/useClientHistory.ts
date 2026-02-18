import { computed } from "vue";
import { useRoute } from "vue-router";
import type { Appointment } from "@/interfaces";
import { useClientStore } from "@/stores/client";
import { useAppointmentStore } from "@/stores/appointment";
import { useServiceStore } from "@/stores/service";
import { useTeamStore } from "@/stores/team";

export interface ClientHistoryEntry {
  appointment: Appointment;
  serviceName: string;
  memberName: string;
  startDate: Date;
  isPast: boolean;
}

const formatHistoryDate = (dateStr: string): string =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

export const useClientHistory = () => {
  const route = useRoute();
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();
  const serviceStore = useServiceStore();
  const teamStore = useTeamStore();

  const clientId = computed(() => route.params.id as string);
  const client = computed(() =>
    clientId.value ? clientStore.getClientById(clientId.value) : null
  );

  const historyEntries = computed((): ClientHistoryEntry[] => {
    if (!clientId.value) return [];
    const appointments = appointmentStore.getByClient(clientId.value);
    const now = new Date();
    return appointments
      .map((apt) => {
        const startDate = new Date(apt.start);
        const service = apt.serviceId
          ? serviceStore.getServiceById(apt.serviceId)
          : null;
        const member = apt.memberId
          ? teamStore.getMemberById(apt.memberId)
          : null;
        return {
          appointment: apt,
          serviceName: service?.name ?? "—",
          memberName: member?.name ?? "—",
          startDate,
          isPast: startDate < now,
        };
      })
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  });

  const formatHistoryDateRef = formatHistoryDate;

  return {
    clientId,
    client,
    historyEntries,
    formatHistoryDate: formatHistoryDateRef,
  };
};

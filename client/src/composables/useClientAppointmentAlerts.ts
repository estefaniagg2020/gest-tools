import { computed, type Ref } from "vue";
import { useAppointmentStore } from "@/stores/appointment";

const NO_SHOW_THRESHOLD = 5;

export const useClientAppointmentAlerts = (clientId: Ref<string>) => {
  const appointmentStore = useAppointmentStore();

  const pastClientAppointments = computed(() => {
    const id = clientId.value;
    if (!id) return [];
    const now = Date.now();
    return appointmentStore
      .getByClient(id)
      .filter((a) => new Date(a.end).getTime() < now)
      .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
  });

  const consecutiveNoShows = computed(() => {
    let count = 0;
    for (const apt of pastClientAppointments.value) {
      const attended =
        apt.status === "completed" || apt.paymentStatus === "paid";
      if (attended) break;

      const missed = apt.status === "cancelled" || apt.status === "no_show";
      if (missed) {
        count++;
      }
    }
    return count;
  });

  const hasNoShowAlert = computed(
    () => consecutiveNoShows.value >= NO_SHOW_THRESHOLD,
  );

  const unpaidPastAppointments = computed(() =>
    pastClientAppointments.value.filter(
      (a) =>
        a.status !== "cancelled" &&
        a.status !== "no_show" &&
        (a.paymentStatus ?? "pending") === "pending",
    ),
  );

  const hasUnpaidAlert = computed(
    () => unpaidPastAppointments.value.length > 0,
  );

  const unpaidCount = computed(() => unpaidPastAppointments.value.length);

  return {
    consecutiveNoShows,
    hasNoShowAlert,
    hasUnpaidAlert,
    unpaidCount,
  };
};

import { ref, type Ref } from "vue";
import type { Appointment } from "@/interfaces";

export type DragState = {
  appointment: Appointment;
  sourceDate: Date;
  sourceMemberId: string;
} | null;

export const useAppointmentDrag = () => {
  const draggingAppointment: Ref<DragState> = ref(null);

  const startDrag = (apt: Appointment, date: Date, memberId: string) => {
    draggingAppointment.value = { appointment: apt, sourceDate: date, sourceMemberId: memberId };
  };

  const endDrag = () => {
    draggingAppointment.value = null;
  };

  const isDragging = (aptId: string) =>
    draggingAppointment.value?.appointment.id === aptId;

  return {
    draggingAppointment,
    startDrag,
    endDrag,
    isDragging,
  };
};

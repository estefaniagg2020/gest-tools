import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { ScheduleBlock } from "@/interfaces";
import type { Appointment } from "@/interfaces/appointment";
import { isSameDay } from "./useScheduleDates";
import { filterBlocksByDay } from "./useScheduleBlocks";

export interface MonthGridDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  blocks: ScheduleBlock[];
  appointments: Appointment[];
}

const CELLS_COUNT = 42;

const filterAppointmentsByDay = (appointments: Appointment[], date: Date): Appointment[] =>
  appointments.filter((apt) => isSameDay(new Date(apt.start), date));

export const useMonthGrid = (
  currentDate: MaybeRefOrGetter<Date>,
  blocks: MaybeRefOrGetter<ScheduleBlock[]>,
  weekStartsOn: MaybeRefOrGetter<0 | 1> = 1,
  appointments: MaybeRefOrGetter<Appointment[]> = () => [],
) => {
  const days = computed<MonthGridDay[]>(() => {
    const date = toValue(currentDate);
    const blocksList = toValue(blocks);
    const appointmentsList = toValue(appointments);
    const startsOn = toValue(weekStartsOn);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const diff = (dayOfWeek - startsOn + 7) % 7;
    startDate.setDate(startDate.getDate() - diff);

    const result: MonthGridDay[] = [];
    const current = new Date(startDate);
    const today = new Date();

    for (let i = 0; i < CELLS_COUNT; i++) {
      const cellDate = new Date(current);
      const isCurrentMonth = cellDate.getMonth() === month;
      const dayBlocks = filterBlocksByDay(blocksList, cellDate).sort(
        (blockA, blockB) => new Date(blockA.start).getTime() - new Date(blockB.start).getTime(),
      );
      const dayAppointments = filterAppointmentsByDay(appointmentsList, cellDate).sort(
        (aptA, aptB) => new Date(aptA.start).getTime() - new Date(aptB.start).getTime(),
      );
      result.push({
        date: cellDate,
        isCurrentMonth,
        isToday: isSameDay(cellDate, today),
        blocks: dayBlocks,
        appointments: dayAppointments,
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  });

  return { days };
};

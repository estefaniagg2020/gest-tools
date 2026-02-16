import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useScheduleStore } from "@/stores/schedule";
import { useTherapistStore } from "@/stores/therapist";
import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
import { isSameDay } from "@/composables/useScheduleDates";
import { blockDurationMinutes } from "@/composables/useScheduleDates";

export interface HourOccupancy {
  hour: number;
  label: string;
  count: number;
  percent: number;
}

const WORK_TYPE = "work";

const getTomorrow = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const blockOverlapsHour = (
  blockStart: string,
  blockEnd: string,
  day: Date,
  hour: number,
): boolean => {
  const start = new Date(blockStart).getTime();
  const end = new Date(blockEnd).getTime();
  const hourStart = new Date(day);
  hourStart.setHours(hour, 0, 0, 0);
  const hourEnd = new Date(day);
  hourEnd.setHours(hour + 1, 0, 0, 0);
  return start < hourEnd.getTime() && end > hourStart.getTime();
};

export const useDashboardAgendaStats = () => {
  const scheduleStore = useScheduleStore();
  const therapistStore = useTherapistStore();
  const schedulerSettingsStore = useSchedulerSettingsStore();
  const { blocks } = storeToRefs(scheduleStore);
  const { therapists } = storeToRefs(therapistStore);
  const { startHour, endHour } = storeToRefs(schedulerSettingsStore);

  const tomorrow = computed(() => getTomorrow());

  const tomorrowLabel = computed(() =>
    tomorrow.value.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
  );

  const workBlocksTomorrow = computed(() => {
    const date = tomorrow.value;
    return blocks.value.filter(
      (b) => b.type === WORK_TYPE && isSameDay(new Date(b.start), date),
    );
  });

  const occupiedMinutes = computed(() =>
    workBlocksTomorrow.value.reduce(
      (sum, b) => sum + blockDurationMinutes(b.start, b.end),
      0,
    ),
  );

  const totalAvailableMinutes = computed(() => {
    const n = therapists.value.length;
    if (n === 0) return 0;
    const hours = Math.max(0, endHour.value - startHour.value);
    return n * hours * 60;
  });

  const occupancyPercent = computed(() => {
    const total = totalAvailableMinutes.value;
    if (total === 0) return 0;
    return Math.min(100, Math.round((occupiedMinutes.value / total) * 100));
  });

  const slotsByHour = computed((): HourOccupancy[] => {
    const date = tomorrow.value;
    const workBlocks = blocks.value.filter(
      (b) => b.type === WORK_TYPE && isSameDay(new Date(b.start), date),
    );
    const maxPeople = Math.max(1, therapists.value.length);
    const rows: HourOccupancy[] = [];
    for (let h = startHour.value; h < endHour.value; h++) {
      const count = workBlocks.filter((b) =>
        blockOverlapsHour(b.start, b.end, date, h),
      ).length;
      rows.push({
        hour: h,
        label: `${h.toString().padStart(2, "0")}:00`,
        count,
        percent: Math.min(100, Math.round((count / maxPeople) * 100)),
      });
    }
    return rows;
  });

  const occupiedHoursFormatted = computed(() => {
    const min = occupiedMinutes.value;
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  });

  const totalHoursFormatted = computed(() => {
    const min = totalAvailableMinutes.value;
    const h = Math.floor(min / 60);
    return `${h} h`;
  });

  return {
    tomorrow,
    tomorrowLabel,
    workBlocksTomorrow,
    workBlocksCount: computed(() => workBlocksTomorrow.value.length),
    occupiedMinutes,
    totalAvailableMinutes,
    occupancyPercent,
    slotsByHour,
    occupiedHoursFormatted,
    totalHoursFormatted,
    therapistCount: computed(() => therapists.value.length),
  };
};

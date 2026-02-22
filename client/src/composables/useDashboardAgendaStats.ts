import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useScheduleStore } from "@/stores/schedule";
import { useTeamStore } from "@/stores/team";
import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
import { useAppointmentStore } from "@/stores/appointment";
import { isSameDay } from "@/composables/useScheduleDates";
import { blockDurationMinutes } from "@/composables/useScheduleDates";

const LOCALE_MAP: Record<string, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-GB",
  de: "de-DE",
};

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
  const { locale } = useI18n();
  const scheduleStore = useScheduleStore();
  const teamStore = useTeamStore();
  const schedulerSettingsStore = useSchedulerSettingsStore();
  const appointmentStore = useAppointmentStore();
  const { blocks } = storeToRefs(scheduleStore);
  const { members } = storeToRefs(teamStore);
  const { startHour, endHour } = storeToRefs(schedulerSettingsStore);
  const { appointments } = storeToRefs(appointmentStore);

  const tomorrow = computed(() => getTomorrow());

  const tomorrowLabel = computed(() => {
    const localeTag = LOCALE_MAP[locale.value] ?? "es-ES";
    return tomorrow.value.toLocaleDateString(localeTag, { weekday: "long", day: "numeric", month: "long" });
  });

  const workBlocksTomorrow = computed(() => {
    const date = tomorrow.value;
    return blocks.value.filter(
      (b) => b.type === WORK_TYPE && isSameDay(new Date(b.start), date),
    );
  });

  const appointmentsTomorrow = computed(() => {
    const date = tomorrow.value;
    return appointments.value.filter(
      (a) =>
        isSameDay(new Date(a.start), date) &&
        a.status !== "cancelled" &&
        a.status !== "no_show",
    );
  });

  const occupiedMinutes = computed(() =>
    appointmentsTomorrow.value.reduce(
      (sum, a) => sum + blockDurationMinutes(a.start, a.end),
      0,
    ),
  );

  const totalAvailableMinutes = computed(() => {
    const n = members.value.length;
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
    const appts = appointmentsTomorrow.value;
    const maxPeople = Math.max(1, members.value.length);
    const rows: HourOccupancy[] = [];
    for (let h = startHour.value; h < endHour.value; h++) {
      const count = appts.filter((a) =>
        blockOverlapsHour(a.start, a.end, date, h),
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
    workBlocksCount: computed(() => appointmentsTomorrow.value.length),
    occupiedMinutes,
    totalAvailableMinutes,
    occupancyPercent,
    slotsByHour,
    occupiedHoursFormatted,
    totalHoursFormatted,
    memberCount: computed(() => members.value.length),
  };
};

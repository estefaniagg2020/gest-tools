import { ref, computed, type MaybeRefOrGetter, toValue } from "vue";
import { getI18nLocaleCode, getIntlLocale, resolveWeekStartsOn } from "@/utils/intlLocale";
import type { WeekStartOption } from "@/interfaces";

export const VIEW_DAY = "day";
export const VIEW_WEEK = "week";
export const VIEW_MONTH = "month";
const DAYS_PER_WEEK = 7;

export type ViewType = typeof VIEW_DAY | typeof VIEW_WEEK | typeof VIEW_MONTH;

const getDaysBackToWeekStart = (dayOfWeek: number, weekStartsOn: 0 | 1) =>
  (dayOfWeek - weekStartsOn + 7) % 7;

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const useCalendar = (opts?: {
  weekStart?: MaybeRefOrGetter<WeekStartOption>;
  workDaysPerWeek?: MaybeRefOrGetter<number | undefined>;
}) => {
  const currentDate = ref(new Date());
  const view = ref<ViewType>(VIEW_WEEK);
  const weekStart = computed<WeekStartOption>(() => toValue(opts?.weekStart) ?? "locale");
  const weekStartsOn = computed<0 | 1>(() => resolveWeekStartsOn(weekStart.value, getI18nLocaleCode()));
  const workDaysPerWeek = computed(() => {
    const v = toValue(opts?.workDaysPerWeek);
    return typeof v === "number" && v >= 1 && v <= 7 ? Math.floor(v) : DAYS_PER_WEEK;
  });

  const startOfWeek = computed(() => {
    const d = new Date(currentDate.value.getTime());
    const daysBack = getDaysBackToWeekStart(d.getDay(), weekStartsOn.value);
    d.setDate(d.getDate() - daysBack);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weekDays = computed(() => {
    const start = startOfWeek.value;
    const y = start.getFullYear();
    const m = start.getMonth();
    const d = start.getDate();
    const count = workDaysPerWeek.value;
    return Array.from({ length: count }, (_, i) => new Date(y, m, d + i));
  });

  const monthDays = computed(() => {
    const d = currentDate.value;
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = getDaysInMonth(d);
    return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1));
  });

  const advanceByView = (delta: number) => {
    const d = new Date(currentDate.value.getTime());
    const v = view.value;
    if (v === VIEW_DAY) d.setDate(d.getDate() + delta);
    else if (v === VIEW_WEEK) d.setDate(d.getDate() + delta * DAYS_PER_WEEK);
    else if (v === VIEW_MONTH) d.setMonth(d.getMonth() + delta);
    currentDate.value = d;
  };

  const next = () => advanceByView(1);
  const prev = () => advanceByView(-1);

  const setToday = () => {
    currentDate.value = new Date();
  };

  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) =>
    new Intl.DateTimeFormat(getIntlLocale(), options).format(date);

  return {
    currentDate,
    view,
    startOfWeek,
    weekDays,
    monthDays,
    weekStartsOn,
    next,
    prev,
    setToday,
    formatDate,
  };
};

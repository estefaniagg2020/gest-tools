import { ref, computed } from "vue";

export const VIEW_DAY = "day";
export const VIEW_WEEK = "week";
export const VIEW_MONTH = "month";
const DAYS_PER_WEEK = 7;
const DATE_FORMAT_LOCALE = "es-ES";

export type ViewType = typeof VIEW_DAY | typeof VIEW_WEEK | typeof VIEW_MONTH;

const getDaysBackToMonday = (dayOfWeek: number) => (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const useCalendar = () => {
  const currentDate = ref(new Date());
  const view = ref<ViewType>(VIEW_WEEK);

  const startOfWeek = computed(() => {
    const d = new Date(currentDate.value.getTime());
    const daysBack = getDaysBackToMonday(d.getDay());
    d.setDate(d.getDate() - daysBack);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weekDays = computed(() => {
    const start = startOfWeek.value;
    const y = start.getFullYear();
    const m = start.getMonth();
    const d = start.getDate();
    return Array.from({ length: DAYS_PER_WEEK }, (_, i) => new Date(y, m, d + i));
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
    new Intl.DateTimeFormat(DATE_FORMAT_LOCALE, options).format(date);

  return {
    currentDate,
    view,
    startOfWeek,
    weekDays,
    monthDays,
    next,
    prev,
    setToday,
    formatDate,
  };
};

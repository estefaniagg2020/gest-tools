export const isSameDay = (d1: Date, d2: Date): boolean =>
  d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

export const formatHour = (hour: number): string => `${hour.toString().padStart(2, "0")}:00`;

export const formatSlotLabel = (hour: number): string => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatDayName = (date: Date): string => new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(date);

export const formatTime = (dateStr: string): string =>
  new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));

export const blockDurationMinutes = (start: string, end: string): number =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);

export const formatDuration = (start: string, end: string): string => {
  const min = blockDurationMinutes(start, end);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
};

export const isToday = (date: Date): boolean => isSameDay(date, new Date());

export const useScheduleDates = () => ({
  isSameDay,
  isToday,
  formatHour,
  formatSlotLabel,
  formatDayName,
  formatTime,
  blockDurationMinutes,
  formatDuration,
});

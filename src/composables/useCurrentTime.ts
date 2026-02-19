import { ref, onMounted, onUnmounted } from "vue";
import { getIntlLocale } from "@/utils/intlLocale";
import { useGestorConfigStore } from "@/stores/gestorConfig";

const formatTime = (date: Date, timeZone?: string): string => {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...(timeZone && { timeZone }),
  }).format(date);
};

export const useCurrentTime = (intervalMs = 1000) => {
  const gestorConfigStore = useGestorConfigStore();
  const currentTime = ref("");
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    const timeZone = gestorConfigStore.isCanarias ? "Atlantic/Canary" : undefined;
    currentTime.value = formatTime(new Date(), timeZone);
  };

  onMounted(() => {
    tick();
    intervalId = setInterval(tick, intervalMs);
  });

  onUnmounted(() => {
    if (intervalId !== null) clearInterval(intervalId);
  });

  return { currentTime };
};

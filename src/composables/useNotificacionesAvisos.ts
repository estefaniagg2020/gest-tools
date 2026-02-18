import { computed, onMounted } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import { useTeamStore } from "@/stores/team";
import { useDashboardBookingStats } from "@/composables/useDashboardBookingStats";
import type { ScheduleBlock } from "@/interfaces";
import type { ProductoBajoStockItem } from "@/interfaces/dashboardStats";

const VACATION_BLOCK_TYPE = "vacation";
const DAYS_VACATION_AHEAD = 14;

export interface VacacionProxima {
  memberName: string;
  start: string;
  end: string;
  title: string;
}

export interface CumpleaniosProximo {
  name: string;
  birthDate: string;
  label: string;
}

const parseIsoDate = (s: string): Date => {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

const toDateOnly = (d: Date): string => d.toISOString().slice(0, 10);

const getMonthDay = (isoDate: string): { month: number; day: number } => {
  const d = parseIsoDate(isoDate);
  return { month: d.getMonth(), day: d.getDate() };
};

const isSameMonthDay = (
  a: { month: number; day: number },
  b: { month: number; day: number },
): boolean => a.month === b.month && a.day === b.day;

const formatShortDate = (iso: string): string =>
  parseIsoDate(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

export const useNotificacionesAvisos = () => {
  const scheduleStore = useScheduleStore();
  const teamStore = useTeamStore();
  const bookingStats = useDashboardBookingStats();

  const vacacionesProximas = computed<VacacionProxima[]>(() => {
    const today = toDateOnly(new Date());
    const startOnly = (s: string) => s.slice(0, 10);
    const blocks = scheduleStore.blocks.filter(
      (b): b is ScheduleBlock =>
        b.type === VACATION_BLOCK_TYPE && startOnly(b.start) >= today,
    );
    const sorted = [...blocks].sort((a, b) => a.start.localeCompare(b.start));
    const endLimit = new Date();
    endLimit.setDate(endLimit.getDate() + DAYS_VACATION_AHEAD);
    const limitDate = toDateOnly(endLimit);
    const inRange = sorted.filter((b) => startOnly(b.start) <= limitDate);
    return inRange.map((b) => {
      const member = teamStore.getMemberById(b.memberId);
      return {
        memberName: member?.name ?? "—",
        start: b.start,
        end: b.end,
        title: b.title || "Vacaciones",
      };
    });
  });

  const productosBajoStock = computed<ProductoBajoStockItem[]>(() => {
    return bookingStats.stats.value?.productosBajoStock ?? [];
  });

  const cumpleaniosEstaSemana = computed<CumpleaniosProximo[]>(() => {
    const members = teamStore.members.filter((m) => m.birthDate?.trim());
    if (members.length === 0) return [];
    const now = new Date();
    const result: CumpleaniosProximo[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const target = getMonthDay(d.toISOString().slice(0, 10));
      for (const m of members) {
        const bd = getMonthDay(m.birthDate!);
        if (isSameMonthDay(bd, target)) {
          const label =
            i === 0 ? "Hoy" : i === 1 ? "Mañana" : formatShortDate(`${d.getFullYear()}-${String(target.month + 1).padStart(2, "0")}-${String(target.day).padStart(2, "0")}`);
          result.push({
            name: m.name,
            birthDate: m.birthDate!,
            label,
          });
        }
      }
    }
    return result.sort((a, b) => a.birthDate.localeCompare(b.birthDate));
  });

  const cumpleaniosEsteMes = computed<CumpleaniosProximo[]>(() => {
    const members = teamStore.members.filter((m) => m.birthDate?.trim());
    if (members.length === 0) return [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const today = now.getDate();
    const result: CumpleaniosProximo[] = [];
    for (const m of members) {
      const bd = getMonthDay(m.birthDate!);
      if (bd.month !== currentMonth) continue;
      if (bd.day < today) continue;
      const iso = `${now.getFullYear()}-${String(bd.month + 1).padStart(2, "0")}-${String(bd.day).padStart(2, "0")}`;
      const dayLabel = bd.day === today ? "Hoy" : formatShortDate(iso);
      result.push({ name: m.name, birthDate: m.birthDate!, label: dayLabel });
    }
    return result.sort((a, b) => a.birthDate.localeCompare(b.birthDate));
  });

  const cumpleaniosRestoDelMes = computed<CumpleaniosProximo[]>(() => {
    const estaSemanaKeys = new Set(
      cumpleaniosEstaSemana.value.map((c) => `${c.name}-${c.birthDate}`),
    );
    return cumpleaniosEsteMes.value.filter(
      (c) => !estaSemanaKeys.has(`${c.name}-${c.birthDate}`),
    );
  });

  onMounted(() => {
    scheduleStore.initialize();
    teamStore.initialize();
  });

  return {
    vacacionesProximas,
    productosBajoStock,
    cumpleaniosEstaSemana,
    cumpleaniosEsteMes,
    cumpleaniosRestoDelMes,
    loading: bookingStats.loading,
    error: bookingStats.error,
  };
};

import { apiFetch } from "./apiClient";

export interface BusinessConfig {
  id?: string;
  businessId?: string;
  professionId?: string | null;
  profession?: { code: string; label: string } | null;
  whatsappRemindersEnabled?: boolean;
  whatsappPhoneNumberId?: string | null;
  defaultVatPercent?: number;
  cartEnabled?: boolean;
  bonosEnabled?: boolean;
  serviciosEnabled?: boolean;
  inventarioEnabled?: boolean;
  hiddenSystemServiceNames?: string[];
  sameColorsForAll?: boolean;
  agendaBg?: string;
  markedDaysColor?: string;
  vacationColor?: string;
  perAgendaColors?: unknown;
  themeId?: string | null;
  colorMode?: string | null;
  customColors?: any;
  titleTextOverrides?: any;
  moduleIcons?: any;
  startHour?: number;
  endHour?: number;
  pixelsPerHour?: number;
  slotDurationMinutes?: number;
  workDaysPerWeek?: number;
  maxPeoplePerSlot?: number;
  defaultView?: string | null;
  weekStart?: string | null;
  agendaListConfig?: any;
  sidebarPosition?: string;
  showNavbar?: boolean;
  calendarAppearance?: string;
  sidebarModuleIds?: string[];
  dashboardModuleIds?: string[];
  smartFillingEnabled?: boolean;
  smartFillingDiscountPercent?: number;
  [key: string]: unknown;
}

export const businessConfigApi = {
  getConfig: async (businessId: string): Promise<BusinessConfig | null> => {
    const res = await apiFetch(`/api/businesses/${businessId}/config`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error al cargar la configuración");
    return res.json();
  },

  updateConfig: async (
    businessId: string,
    payload: Partial<BusinessConfig>,
  ): Promise<BusinessConfig> => {
    const res = await apiFetch(`/api/businesses/${businessId}/config`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al guardar la configuración");
    }
    return data;
  },
};

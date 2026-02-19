export interface ContactData {
  email: string;
  phone: string;
  address?: string;
}

export interface WizardTeamMember {
  id: string;
  name: string;
  specialty: string;
}

export interface GestorConfig {
  companyName: string;
  logoUrl: string | null;
  numberOfPeople: number;
  businessType: string;
  contactData: ContactData;
  onboardingComplete: boolean;
  teamMembers?: WizardTeamMember[];
  businessAddress?: string;
  businessPopulation?: string;
  isCanarias?: boolean;
  taxId?: string;
  // Scheduler Settings
  startHour?: number;
  endHour?: number;
  pixelsPerHour?: number;
  slotDurationMinutes?: number;
  workDaysPerWeek?: number;
  maxPeoplePerSlot?: number;
  defaultView?: string | null;
  weekStart?: string | null;
  // Theme & UI
  themeId?: string | null;
  colorMode?: string | null;
  customColors?: any;
  titleTextOverrides?: any;
  agendaListConfig?: any;
  // Layout
  sidebarPosition?: string;
  showNavbar?: boolean;
  calendarAppearance?: string;
  sidebarModuleIds?: string[];
  dashboardModuleIds?: string[];
  // Module icons
  moduleIcons?: any;
  // Agenda colors
  sameColorsForAll?: boolean;
  agendaBg?: string;
  markedDaysColor?: string;
  vacationColor?: string;
  perAgendaColors?: any;
  // Features
  smartFillingEnabled?: boolean;
  smartFillingDiscountPercent?: number;
  whatsappRemindersEnabled?: boolean;
  whatsappPhoneNumberId?: string | null;
  defaultVatPercent?: number;
  cartEnabled?: boolean;
  bonosEnabled?: boolean;
  serviciosEnabled?: boolean;
  inventarioEnabled?: boolean;
  hiddenSystemServiceNames?: string[];
  locale?: string | null;
  // Public
  bookingEnabled?: boolean;
  depositPercent?: number;
  depositRequired?: boolean;
  publicDescription?: string | null;
  publicPhoneNumber?: string | null;
  slug?: string | null;
  socialLinks?: any;
}

export const DEFAULT_COMPANY_NAME = "Mi Gestor";

export const DEFAULT_CONTACT_DATA: ContactData = {
  email: "",
  phone: "",
  address: "",
};

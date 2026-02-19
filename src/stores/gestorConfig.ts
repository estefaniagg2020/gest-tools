import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { GestorConfig, ContactData, WizardTeamMember } from "@/interfaces";
import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_DATA } from "@/interfaces";
import { businessConfigApi } from "@/infrastructure/businessConfigApi";
import { DEFAULT_LAYOUT_CONFIG } from "@/interfaces";
import { DEFAULT_MODULE_ICONS } from "@/data/moduleIconOptions";

export const useGestorConfigStore = defineStore("gestorConfig", () => {
  const companyName = ref("");
  const logoUrl = ref<string | null>(null);
  const numberOfPeople = ref(1);
  const businessType = ref("");
  const contactData = ref<ContactData>({ ...DEFAULT_CONTACT_DATA });
  const onboardingComplete = ref(false);
  const teamMembers = ref<WizardTeamMember[]>([]);
  const businessAddress = ref("");
  const businessPopulation = ref("");
  const isCanarias = ref(false);
  const taxId = ref("");

  // Scheduler & UI
  const startHour = ref(9);
  const endHour = ref(20);
  const pixelsPerHour = ref(80);
  const slotDurationMinutes = ref(60);
  const workDaysPerWeek = ref(5);
  const maxPeoplePerSlot = ref(1);
  const defaultView = ref<string | null>("week");
  const weekStart = ref<string | null>("locale");
  const themeId = ref<string | null>(null);
  const colorMode = ref<string | null>("system");
  const customColors = ref<any>(null);
  const titleTextOverrides = ref<any>(null);
  const agendaListConfig = ref<any>(null);

  // Agenda / Colors
  const sameColorsForAll = ref(true);
  const agendaBg = ref("#ffffff");
  const markedDaysColor = ref("#3498db");
  const vacationColor = ref("#e74c3c");
  const perAgendaColors = ref<any>(null);

  // Layout
  const sidebarPosition = ref(DEFAULT_LAYOUT_CONFIG.sidebarPosition as string);
  const showNavbar = ref(DEFAULT_LAYOUT_CONFIG.showNavbar);
  const calendarAppearance = ref(DEFAULT_LAYOUT_CONFIG.calendarAppearance as string);
  const sidebarModuleIds = ref<string[]>([...DEFAULT_LAYOUT_CONFIG.sidebarModuleIds]);
  const dashboardModuleIds = ref<string[]>([...DEFAULT_LAYOUT_CONFIG.dashboardModuleIds]);

  // Settings & Features
  const smartFillingEnabled = ref(false);
  const smartFillingDiscountPercent = ref(10);
  const whatsappRemindersEnabled = ref(false);
  const whatsappPhoneNumberId = ref<string | null>(null);
  const defaultVatPercent = ref(21);
  const cartEnabled = ref(false);
  const bonosEnabled = ref(true);
  const serviciosEnabled = ref(true);
  const inventarioEnabled = ref(true);
  const hiddenSystemServiceNames = ref<string[]>([]);
  const locale = ref<string | null>(null);

  // Public / Booking
  const bookingEnabled = ref(false);
  const depositPercent = ref(0);
  const depositRequired = ref(false);
  const publicDescription = ref<string | null>(null);
  const publicPhoneNumber = ref<string | null>(null);
  const slug = ref<string | null>(null);
  const socialLinks = ref<any>(null);

  // Module icons
  const moduleIcons = ref<any>({ ...DEFAULT_MODULE_ICONS });

  const displayCompanyName = computed(() =>
    companyName.value.trim() || DEFAULT_COMPANY_NAME,
  );

  const displayLogoUrl = computed(() => logoUrl.value);

  const initialize = async (_userId: string, businessId?: string | null) => {
    if (!businessId) return;
    try {
      const apiConfig = await businessConfigApi.getConfig(businessId);
      if (apiConfig) {
        applyConfigToRefs({
          companyName: (apiConfig.companyName as string) || companyName.value,
          logoUrl: (apiConfig.logoUrl as string | null) ?? null,
          numberOfPeople: apiConfig.numberOfPeople ?? numberOfPeople.value,
          businessType: (apiConfig.professionId as string) || businessType.value,
          contactData: {
            email: (apiConfig.email as string) || "",
            phone: (apiConfig.phone as string) || "",
            address: (apiConfig.address as string) || "",
          },
          onboardingComplete: (apiConfig.onboardingComplete as boolean) ?? false,
          businessAddress: (apiConfig.address as string) ?? "",
          startHour: (apiConfig.startHour as number) ?? startHour.value,
          endHour: (apiConfig.endHour as number) ?? endHour.value,
          pixelsPerHour: (apiConfig.pixelsPerHour as number) ?? pixelsPerHour.value,
          slotDurationMinutes: (apiConfig.slotDurationMinutes as number) ?? slotDurationMinutes.value,
          workDaysPerWeek: (apiConfig.workDaysPerWeek as number) ?? workDaysPerWeek.value,
          maxPeoplePerSlot: (apiConfig.maxPeoplePerSlot as number) ?? maxPeoplePerSlot.value,
          defaultView: (apiConfig.defaultView as string | null) ?? null,
          weekStart: (apiConfig.weekStart as string | null) ?? "locale",
          themeId: (apiConfig.themeId as string | null) ?? null,
          colorMode: (apiConfig.colorMode as string | null) ?? "system",
          customColors: apiConfig.customColors ?? null,
          titleTextOverrides: apiConfig.titleTextOverrides ?? null,
          agendaListConfig: apiConfig.agendaListConfig ?? null,
          sidebarPosition: (apiConfig.sidebarPosition as string) ?? DEFAULT_LAYOUT_CONFIG.sidebarPosition,
          showNavbar: (apiConfig.showNavbar as boolean) ?? DEFAULT_LAYOUT_CONFIG.showNavbar,
          calendarAppearance: (apiConfig.calendarAppearance as string) ?? DEFAULT_LAYOUT_CONFIG.calendarAppearance,
          sidebarModuleIds: (apiConfig.sidebarModuleIds as string[]) ?? [...DEFAULT_LAYOUT_CONFIG.sidebarModuleIds],
          dashboardModuleIds: (apiConfig.dashboardModuleIds as string[]) ?? [...DEFAULT_LAYOUT_CONFIG.dashboardModuleIds],
          moduleIcons: apiConfig.moduleIcons ?? { ...DEFAULT_MODULE_ICONS },
          // Agenda colors
          sameColorsForAll: (apiConfig.sameColorsForAll as boolean) ?? sameColorsForAll.value,
          agendaBg: (apiConfig.agendaBg as string) ?? agendaBg.value,
          markedDaysColor: (apiConfig.markedDaysColor as string) ?? markedDaysColor.value,
          vacationColor: (apiConfig.vacationColor as string) ?? vacationColor.value,
          perAgendaColors: apiConfig.perAgendaColors ?? perAgendaColors.value,
          // Features
          smartFillingEnabled: (apiConfig.smartFillingEnabled as boolean) ?? smartFillingEnabled.value,
          smartFillingDiscountPercent: (apiConfig.smartFillingDiscountPercent as number) ?? smartFillingDiscountPercent.value,
          whatsappRemindersEnabled: (apiConfig.whatsappRemindersEnabled as boolean) ?? whatsappRemindersEnabled.value,
          whatsappPhoneNumberId: (apiConfig.whatsappPhoneNumberId as string | null) ?? whatsappPhoneNumberId.value,
          defaultVatPercent: (apiConfig.defaultVatPercent as number) ?? defaultVatPercent.value,
          cartEnabled: (apiConfig.cartEnabled as boolean) ?? cartEnabled.value,
          bonosEnabled: (apiConfig.bonosEnabled as boolean) ?? bonosEnabled.value,
          serviciosEnabled: (apiConfig.serviciosEnabled as boolean) ?? serviciosEnabled.value,
          inventarioEnabled: (apiConfig.inventarioEnabled as boolean) ?? inventarioEnabled.value,
          hiddenSystemServiceNames: (apiConfig.hiddenSystemServiceNames as string[]) ?? hiddenSystemServiceNames.value,
          locale: (apiConfig.locale as string | null) ?? locale.value,
          // Public
          bookingEnabled: (apiConfig.bookingEnabled as boolean) ?? bookingEnabled.value,
          depositPercent: (apiConfig.depositPercent as number) ?? depositPercent.value,
          depositRequired: (apiConfig.depositRequired as boolean) ?? depositRequired.value,
          publicDescription: (apiConfig.description as string | null) ?? publicDescription.value,
          publicPhoneNumber: (apiConfig.publicPhoneNumber as string | null) ?? publicPhoneNumber.value,
          slug: (apiConfig.slug as string | null) ?? slug.value,
          socialLinks: apiConfig.socialLinks ?? socialLinks.value,
        });
      }
    } catch (err) {
      console.error("Failed to hydrate config from API:", err);
    }
  };

  const applyConfigToRefs = (config: GestorConfig) => {
    companyName.value = config.companyName || companyName.value;
    logoUrl.value = config.logoUrl;
    numberOfPeople.value = config.numberOfPeople;
    businessType.value = config.businessType;
    contactData.value = { ...DEFAULT_CONTACT_DATA, ...config.contactData };
    onboardingComplete.value = config.onboardingComplete;
    teamMembers.value = config.teamMembers ?? [];
    businessAddress.value = config.businessAddress ?? "";
    businessPopulation.value = config.businessPopulation ?? "";
    isCanarias.value = config.isCanarias ?? false;
    taxId.value = config.taxId ?? "";

    if (config.startHour !== undefined) startHour.value = config.startHour;
    if (config.endHour !== undefined) endHour.value = config.endHour;
    if (config.pixelsPerHour !== undefined) pixelsPerHour.value = config.pixelsPerHour;
    if (config.slotDurationMinutes !== undefined) slotDurationMinutes.value = config.slotDurationMinutes;
    if (config.workDaysPerWeek !== undefined) workDaysPerWeek.value = config.workDaysPerWeek;
    if (config.maxPeoplePerSlot !== undefined) maxPeoplePerSlot.value = config.maxPeoplePerSlot;
    if (config.defaultView !== undefined) defaultView.value = config.defaultView;
    if (config.weekStart !== undefined) weekStart.value = config.weekStart;
    if (config.themeId !== undefined) themeId.value = config.themeId;
    if (config.colorMode !== undefined) colorMode.value = config.colorMode;
    if (config.customColors !== undefined) customColors.value = config.customColors;
    if (config.titleTextOverrides !== undefined) titleTextOverrides.value = config.titleTextOverrides;
    if (config.agendaListConfig !== undefined) agendaListConfig.value = config.agendaListConfig;
    if (config.sidebarPosition !== undefined) sidebarPosition.value = config.sidebarPosition;
    if (config.showNavbar !== undefined) showNavbar.value = config.showNavbar;
    if (config.calendarAppearance !== undefined) calendarAppearance.value = config.calendarAppearance;
    if (config.sidebarModuleIds !== undefined) sidebarModuleIds.value = [...config.sidebarModuleIds];
    if (config.dashboardModuleIds !== undefined) dashboardModuleIds.value = [...config.dashboardModuleIds];
    if (config.moduleIcons !== undefined) moduleIcons.value = config.moduleIcons;

    // Agenda colors
    if (config.sameColorsForAll !== undefined) sameColorsForAll.value = config.sameColorsForAll;
    if (config.agendaBg !== undefined) agendaBg.value = config.agendaBg;
    if (config.markedDaysColor !== undefined) markedDaysColor.value = config.markedDaysColor;
    if (config.vacationColor !== undefined) vacationColor.value = config.vacationColor;
    if (config.perAgendaColors !== undefined) perAgendaColors.value = config.perAgendaColors;

    // Features
    if (config.smartFillingEnabled !== undefined) smartFillingEnabled.value = config.smartFillingEnabled;
    if (config.smartFillingDiscountPercent !== undefined) smartFillingDiscountPercent.value = config.smartFillingDiscountPercent;
    if (config.whatsappRemindersEnabled !== undefined) whatsappRemindersEnabled.value = config.whatsappRemindersEnabled;
    if (config.whatsappPhoneNumberId !== undefined) whatsappPhoneNumberId.value = config.whatsappPhoneNumberId;
    if (config.defaultVatPercent !== undefined) defaultVatPercent.value = config.defaultVatPercent;
    if (config.cartEnabled !== undefined) cartEnabled.value = config.cartEnabled;
    if (config.bonosEnabled !== undefined) bonosEnabled.value = config.bonosEnabled;
    if (config.serviciosEnabled !== undefined) serviciosEnabled.value = config.serviciosEnabled;
    if (config.inventarioEnabled !== undefined) inventarioEnabled.value = config.inventarioEnabled;
    if (config.hiddenSystemServiceNames !== undefined) hiddenSystemServiceNames.value = [...config.hiddenSystemServiceNames];
    if (config.locale !== undefined) locale.value = config.locale;

    // Public
    if (config.bookingEnabled !== undefined) bookingEnabled.value = config.bookingEnabled;
    if (config.depositPercent !== undefined) depositPercent.value = config.depositPercent;
    if (config.depositRequired !== undefined) depositRequired.value = config.depositRequired;
    if (config.publicDescription !== undefined) publicDescription.value = config.publicDescription;
    if (config.publicPhoneNumber !== undefined) publicPhoneNumber.value = config.publicPhoneNumber;
    if (config.slug !== undefined) slug.value = config.slug;
    if (config.socialLinks !== undefined) socialLinks.value = config.socialLinks;
  };

  const setConfig = async (_userId: string, config: GestorConfig, businessId?: string | null) => {
    applyConfigToRefs(config);

    if (businessId) {
      try {
        const payload: any = {
          ...config,
          professionId: config.businessType || null,
          email: config.contactData.email,
          phone: config.contactData.phone,
          address: config.contactData.address || config.businessAddress,
        };
        await businessConfigApi.updateConfig(businessId, payload);
      } catch (err) {
        console.error("Failed to sync config to API:", err);
      }
    }
  };

  const getConfig = (): GestorConfig => ({
    companyName: companyName.value,
    logoUrl: logoUrl.value,
    numberOfPeople: numberOfPeople.value,
    businessType: businessType.value,
    contactData: { ...contactData.value },
    onboardingComplete: onboardingComplete.value,
    teamMembers: teamMembers.value.map((m) => ({ ...m })),
    businessAddress: businessAddress.value || undefined,
    businessPopulation: businessPopulation.value || undefined,
    isCanarias: isCanarias.value || undefined,
    taxId: taxId.value?.trim() || undefined,
    startHour: startHour.value,
    endHour: endHour.value,
    pixelsPerHour: pixelsPerHour.value,
    slotDurationMinutes: slotDurationMinutes.value,
    workDaysPerWeek: workDaysPerWeek.value,
    maxPeoplePerSlot: maxPeoplePerSlot.value,
    defaultView: defaultView.value,
    weekStart: weekStart.value,
    themeId: themeId.value,
    colorMode: colorMode.value,
    customColors: customColors.value,
    titleTextOverrides: titleTextOverrides.value,
    agendaListConfig: agendaListConfig.value,
    sidebarPosition: sidebarPosition.value,
    showNavbar: showNavbar.value,
    calendarAppearance: calendarAppearance.value,
    sidebarModuleIds: [...sidebarModuleIds.value],
    dashboardModuleIds: [...dashboardModuleIds.value],
    moduleIcons: moduleIcons.value,
    // Agenda colors
    sameColorsForAll: sameColorsForAll.value,
    agendaBg: agendaBg.value,
    markedDaysColor: markedDaysColor.value,
    vacationColor: vacationColor.value,
    perAgendaColors: perAgendaColors.value,
    // Features
    smartFillingEnabled: smartFillingEnabled.value,
    smartFillingDiscountPercent: smartFillingDiscountPercent.value,
    whatsappRemindersEnabled: whatsappRemindersEnabled.value,
    whatsappPhoneNumberId: whatsappPhoneNumberId.value,
    defaultVatPercent: defaultVatPercent.value,
    cartEnabled: cartEnabled.value,
    bonosEnabled: bonosEnabled.value,
    serviciosEnabled: serviciosEnabled.value,
    inventarioEnabled: inventarioEnabled.value,
    hiddenSystemServiceNames: [...hiddenSystemServiceNames.value],
    locale: locale.value,
    // Public
    bookingEnabled: bookingEnabled.value,
    depositPercent: depositPercent.value,
    depositRequired: depositRequired.value,
    publicDescription: publicDescription.value,
    publicPhoneNumber: publicPhoneNumber.value,
    slug: slug.value,
    socialLinks: socialLinks.value,
  });

  const markOnboardingComplete = async (_userId: string, businessId?: string | null) => {
    onboardingComplete.value = true;
    if (businessId) {
      try {
        await businessConfigApi.updateConfig(businessId, { onboardingComplete: true });
      } catch (err) {
        console.error("Failed to mark onboarding complete:", err);
      }
    }
  };

  return {
    companyName,
    logoUrl,
    numberOfPeople,
    businessType,
    contactData,
    onboardingComplete,
    teamMembers,
    businessAddress,
    businessPopulation,
    isCanarias,
    taxId,
    startHour,
    endHour,
    pixelsPerHour,
    slotDurationMinutes,
    workDaysPerWeek,
    maxPeoplePerSlot,
    defaultView,
    weekStart,
    themeId,
    colorMode,
    customColors,
    titleTextOverrides,
    agendaListConfig,
    sidebarPosition,
    showNavbar,
    calendarAppearance,
    sidebarModuleIds,
    dashboardModuleIds,
    moduleIcons,
    sameColorsForAll,
    agendaBg,
    markedDaysColor,
    vacationColor,
    perAgendaColors,
    smartFillingEnabled,
    smartFillingDiscountPercent,
    whatsappRemindersEnabled,
    whatsappPhoneNumberId,
    defaultVatPercent,
    cartEnabled,
    bonosEnabled,
    serviciosEnabled,
    inventarioEnabled,
    hiddenSystemServiceNames,
    locale,
    bookingEnabled,
    depositPercent,
    depositRequired,
    publicDescription,
    publicPhoneNumber,
    slug,
    socialLinks,
    displayCompanyName,
    displayLogoUrl,
    initialize,
    setConfig,
    getConfig,
    markOnboardingComplete,
  };
});

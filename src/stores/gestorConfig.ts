import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { GestorConfig, ContactData } from "@/interfaces";
import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_DATA } from "@/interfaces";
import * as gestorConfigStorage from "@/infrastructure/gestorConfigStorage";

export const useGestorConfigStore = defineStore("gestorConfig", () => {
  const companyName = ref("");
  const logoUrl = ref<string | null>(null);
  const numberOfPeople = ref(1);
  const businessType = ref("");
  const contactData = ref<ContactData>({ ...DEFAULT_CONTACT_DATA });
  const onboardingComplete = ref(false);

  const displayCompanyName = computed(() =>
    companyName.value.trim() || DEFAULT_COMPANY_NAME,
  );

  const displayLogoUrl = computed(() => logoUrl.value);

  const initialize = (userId: string) => {
    const stored = gestorConfigStorage.loadGestorConfig(userId);
    if (stored) {
      companyName.value = stored.companyName;
      logoUrl.value = stored.logoUrl;
      numberOfPeople.value = stored.numberOfPeople;
      businessType.value = stored.businessType;
      contactData.value = { ...DEFAULT_CONTACT_DATA, ...stored.contactData };
      onboardingComplete.value = stored.onboardingComplete;
    } else {
      companyName.value = "";
      logoUrl.value = null;
      numberOfPeople.value = 1;
      businessType.value = "";
      contactData.value = { ...DEFAULT_CONTACT_DATA };
      onboardingComplete.value = false;
    }
  };

  const setConfig = (userId: string, config: GestorConfig) => {
    companyName.value = config.companyName;
    logoUrl.value = config.logoUrl;
    numberOfPeople.value = config.numberOfPeople;
    businessType.value = config.businessType;
    contactData.value = { ...DEFAULT_CONTACT_DATA, ...config.contactData };
    onboardingComplete.value = config.onboardingComplete;
    gestorConfigStorage.saveGestorConfig(userId, config);
  };

  const getConfig = (): GestorConfig => ({
    companyName: companyName.value,
    logoUrl: logoUrl.value,
    numberOfPeople: numberOfPeople.value,
    businessType: businessType.value,
    contactData: { ...contactData.value },
    onboardingComplete: onboardingComplete.value,
  });

  const markOnboardingComplete = (userId: string) => {
    onboardingComplete.value = true;
    gestorConfigStorage.saveGestorConfig(userId, getConfig());
  };

  return {
    companyName,
    logoUrl,
    numberOfPeople,
    businessType,
    contactData,
    onboardingComplete,
    displayCompanyName,
    displayLogoUrl,
    initialize,
    setConfig,
    getConfig,
    markOnboardingComplete,
  };
});

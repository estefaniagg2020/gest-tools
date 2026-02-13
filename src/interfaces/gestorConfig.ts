export interface ContactData {
  email: string;
  phone: string;
  address?: string;
}

export interface GestorConfig {
  companyName: string;
  logoUrl: string | null;
  numberOfPeople: number;
  businessType: string;
  contactData: ContactData;
  onboardingComplete: boolean;
}

export const DEFAULT_COMPANY_NAME = "Mi Gestor";

export const DEFAULT_CONTACT_DATA: ContactData = {
  email: "",
  phone: "",
  address: "",
};

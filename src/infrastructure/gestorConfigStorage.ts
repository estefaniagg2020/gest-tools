import type { GestorConfig, ContactData } from "@/interfaces";
import { DEFAULT_CONTACT_DATA } from "@/interfaces";

const KEY_PREFIX = "gestor-config-";

function isContactData(value: unknown): value is ContactData {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    "phone" in value &&
    typeof (value as ContactData).email === "string" &&
    typeof (value as ContactData).phone === "string"
  );
}

function normalizeStored(value: unknown): GestorConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  if (typeof o.companyName !== "string") return null;
  const logoUrl = o.logoUrl === null || typeof o.logoUrl === "string" ? o.logoUrl : null;
  const numberOfPeople =
    typeof o.numberOfPeople === "number" && o.numberOfPeople >= 0 ? o.numberOfPeople : 1;
  const businessType = typeof o.businessType === "string" ? o.businessType : "";
  const contactData = isContactData(o.contactData)
    ? { ...DEFAULT_CONTACT_DATA, ...o.contactData }
    : DEFAULT_CONTACT_DATA;
  const onboardingComplete = typeof o.onboardingComplete === "boolean" ? o.onboardingComplete : false;
  return {
    companyName: o.companyName,
    logoUrl,
    numberOfPeople,
    businessType,
    contactData,
    onboardingComplete,
  };
}

export function loadGestorConfig(userId: string): GestorConfig | null {
  const raw = localStorage.getItem(KEY_PREFIX + userId);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeStored(parsed);
  } catch {
    return null;
  }
}

export function saveGestorConfig(userId: string, config: GestorConfig): void {
  localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(config));
}

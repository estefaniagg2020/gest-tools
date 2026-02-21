export type BonoType = "pack" | "loyalty";

export interface Bono {
  id: string;
  name: string;
  type: BonoType;
  packTotalSessions?: number;
  packPrice?: number;
  loyaltyTriggerEvery?: number;
  loyaltyRewardSessions?: number;
  serviceId?: string | null;
  serviceCategoryId?: string | null;
}

export interface ClientBono {
  id: string;
  clientId: string;
  bonoId: string;
  remainingSessions?: number;
  paidCount?: number;
  freeSessionsRemaining?: number;
  assignedAt: string;
  expiresAt?: string | null;
}

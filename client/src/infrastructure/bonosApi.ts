import { apiFetch } from "./apiClient";
import type { Bono, ClientBono } from "@/interfaces";

export interface BonoDto {
  id: string;
  name: string;
  type: string;
  sessions: number | null;
  price: number | null;
  validDays: number | null;
  serviceId: string | null;
  serviceCategoryId: string | null;
  loyaltyTriggerEvery?: number | null;
  loyaltyRewardSessions?: number | null;
}

export interface ClientBonoDto {
  id: string;
  clientId: string;
  bonoId: string;
  sessionsUsed: number;
  sessionsTotal: number | null;
  remainingSessions: number | null;
  paidCount: number;
  freeSessionsRemaining: number | null;
  assignedAt: string;
  expiresAt: string | null;
}

const dtoToBono = (dto: BonoDto): Bono => ({
  id: dto.id,
  name: dto.name,
  type: dto.type === "loyalty" ? "loyalty" : "pack",
  packTotalSessions: dto.sessions ?? undefined,
  packPrice: dto.price ?? undefined,
  serviceId: dto.serviceId ?? undefined,
  serviceCategoryId: dto.serviceCategoryId ?? undefined,
  loyaltyTriggerEvery: dto.loyaltyTriggerEvery ?? undefined,
  loyaltyRewardSessions: dto.loyaltyRewardSessions ?? undefined,
});

const bonoToDto = (b: Omit<Bono, "id">): Record<string, unknown> => ({
  name: b.name,
  type: b.type,
  sessions: b.packTotalSessions ?? null,
  price: b.packPrice ?? null,
  serviceId: b.serviceId ?? null,
  serviceCategoryId: b.serviceCategoryId ?? null,
  validDays: null,
  loyaltyTriggerEvery: b.loyaltyTriggerEvery ?? null,
  loyaltyRewardSessions: b.loyaltyRewardSessions ?? null,
});

const dtoToClientBono = (dto: ClientBonoDto & { templateId?: string }): ClientBono => ({
  id: dto.id,
  clientId: dto.clientId,
  bonoId: dto.bonoId ?? dto.templateId ?? "",
  remainingSessions: dto.remainingSessions ?? undefined,
  paidCount: dto.paidCount,
  freeSessionsRemaining: dto.freeSessionsRemaining ?? undefined,
  assignedAt: typeof dto.assignedAt === "string" ? dto.assignedAt : new Date(dto.assignedAt).toISOString(),
  expiresAt: dto.expiresAt ?? undefined,
});

export const bonosApi = {
  getTemplates: async (): Promise<Bono[]> => {
    const res = await apiFetch("/api/bonos/templates");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar bonos");
    return Array.isArray(data) ? data.map(dtoToBono) : [];
  },

  createTemplate: async (payload: Omit<Bono, "id">): Promise<Bono> => {
    const res = await apiFetch("/api/bonos/templates", {
      method: "POST",
      body: JSON.stringify(bonoToDto(payload)),
    });
    const raw = await res.text();
    const data = (() => {
      try {
        return (raw ? JSON.parse(raw) : {}) as { error?: string };
      } catch {
        return {} as { error?: string };
      }
    })();
    if (!res.ok) {
      const msg = typeof data?.error === "string" ? data.error : `Error ${res.status} al crear bono`;
      throw new Error(msg);
    }
    return dtoToBono(data as BonoDto);
  },

  updateTemplate: async (id: string, payload: Partial<Omit<Bono, "id">>): Promise<Bono> => {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.type !== undefined) body.type = payload.type;
    if (payload.packTotalSessions !== undefined) body.sessions = payload.packTotalSessions;
    if (payload.packPrice !== undefined) body.price = payload.packPrice;
    if (payload.serviceId !== undefined) body.serviceId = payload.serviceId;
    if (payload.serviceCategoryId !== undefined) body.serviceCategoryId = payload.serviceCategoryId;
    if (payload.loyaltyTriggerEvery !== undefined) body.loyaltyTriggerEvery = payload.loyaltyTriggerEvery;
    if (payload.loyaltyRewardSessions !== undefined) body.loyaltyRewardSessions = payload.loyaltyRewardSessions;
    const res = await apiFetch(`/api/bonos/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar bono");
    return dtoToBono(data as BonoDto);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/bonos/templates/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar bono");
    }
  },

  getClientBonos: async (): Promise<ClientBono[]> => {
    const res = await apiFetch("/api/bonos/client-bonos");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar bonos de clientes");
    return Array.isArray(data) ? data.map(dtoToClientBono) : [];
  },

  createClientBono: async (clientId: string, bonoId: string): Promise<ClientBono> => {
    const res = await apiFetch("/api/bonos/client-bonos", {
      method: "POST",
      body: JSON.stringify({ clientId, bonoId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al asignar bono a cliente");
    return dtoToClientBono(data as ClientBonoDto);
  },

  updateClientBono: async (id: string, payload: Partial<ClientBonoDto>): Promise<ClientBono> => {
    const res = await apiFetch(`/api/bonos/client-bonos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar bono de cliente");
    return dtoToClientBono(data as ClientBonoDto & { templateId?: string });
  },

  deleteClientBono: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/bonos/client-bonos/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar bono de cliente");
    }
  },
};

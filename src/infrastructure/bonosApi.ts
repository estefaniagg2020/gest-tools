import { apiFetch } from "./apiClient";
import type { BonoTemplate, ClientBono } from "@/interfaces";

export interface BonoTemplateDto {
  id: string;
  name: string;
  type: string;
  sessions: number | null;
  price: number | null;
  validDays: number | null;
  serviceId: string | null;
}

export interface ClientBonoDto {
  id: string;
  clientId: string;
  templateId: string;
  sessionsUsed: number;
  sessionsTotal: number | null;
  remainingSessions: number | null;
  paidCount: number;
  freeSessionsRemaining: number | null;
  assignedAt: string;
  expiresAt: string | null;
}

const dtoToTemplate = (dto: BonoTemplateDto): BonoTemplate => ({
  id: dto.id,
  name: dto.name,
  type: dto.type === "loyalty" ? "loyalty" : "pack",
  packTotalSessions: dto.sessions ?? undefined,
  packPrice: dto.price ?? undefined,
  serviceId: dto.serviceId ?? undefined,
});

const templateToDto = (t: Omit<BonoTemplate, "id">): Record<string, unknown> => ({
  name: t.name,
  type: t.type,
  sessions: t.packTotalSessions ?? null,
  price: t.packPrice ?? null,
  serviceId: t.serviceId ?? null,
});

const dtoToClientBono = (dto: ClientBonoDto): ClientBono => ({
  id: dto.id,
  clientId: dto.clientId,
  templateId: dto.templateId,
  remainingSessions: dto.remainingSessions ?? undefined,
  paidCount: dto.paidCount,
  freeSessionsRemaining: dto.freeSessionsRemaining ?? undefined,
  assignedAt: typeof dto.assignedAt === "string" ? dto.assignedAt : new Date(dto.assignedAt).toISOString(),
  expiresAt: dto.expiresAt ?? undefined,
});

export const bonosApi = {
  getTemplates: async (): Promise<BonoTemplate[]> => {
    const res = await apiFetch("/api/bonos/templates");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar plantillas de bono");
    return Array.isArray(data) ? data.map(dtoToTemplate) : [];
  },

  createTemplate: async (payload: Omit<BonoTemplate, "id">): Promise<BonoTemplate> => {
    const res = await apiFetch("/api/bonos/templates", {
      method: "POST",
      body: JSON.stringify(templateToDto(payload)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al crear plantilla de bono");
    return dtoToTemplate(data as BonoTemplateDto);
  },

  updateTemplate: async (id: string, payload: Partial<Omit<BonoTemplate, "id">>): Promise<BonoTemplate> => {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.type !== undefined) body.type = payload.type;
    if (payload.packTotalSessions !== undefined) body.sessions = payload.packTotalSessions;
    if (payload.packPrice !== undefined) body.price = payload.packPrice;
    if (payload.serviceId !== undefined) body.serviceId = payload.serviceId;
    const res = await apiFetch(`/api/bonos/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar plantilla de bono");
    return dtoToTemplate(data as BonoTemplateDto);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/bonos/templates/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar plantilla de bono");
    }
  },

  getClientBonos: async (): Promise<ClientBono[]> => {
    const res = await apiFetch("/api/bonos/client-bonos");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al cargar bonos de clientes");
    return Array.isArray(data) ? data.map(dtoToClientBono) : [];
  },

  createClientBono: async (clientId: string, templateId: string): Promise<ClientBono> => {
    const res = await apiFetch("/api/bonos/client-bonos", {
      method: "POST",
      body: JSON.stringify({ clientId, templateId }),
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
    return dtoToClientBono(data as ClientBonoDto);
  },

  deleteClientBono: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/bonos/client-bonos/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al eliminar bono de cliente");
    }
  },
};

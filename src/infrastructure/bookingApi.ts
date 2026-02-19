import { apiFetch } from "./apiClient";
import type { CatalogCategory } from "@/interfaces";

export interface Business {
  id: string;
  name: string;
  themeColor?: string | null;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  serviceCategory: { id: string; label: string; icon: string };
  duration: number;
  price: number;
  description?: string | null;
}

export interface Slot {
  start: string;
  end: string;
  discountPercent?: number;
}

export interface WaitlistEntry {
  id: string;
  businessId: string;
  serviceId: string;
  preferredStart: string;
  preferredEnd: string;
  createdAt: string;
  business?: { name: string };
  service?: { name: string };
}

export interface WaitlistNotification {
  id: string;
  businessId: string;
  serviceId: string;
  slotStart: string;
  slotEnd: string;
  readAt: string | null;
  createdAt: string;
}

export const bookingApi = {
  getBusinesses: async (): Promise<Business[]> => {
    const res = await apiFetch("/api/businesses");
    if (!res.ok) throw new Error("Error al cargar negocios");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  getServices: async (businessId: string): Promise<Service[]> => {
    const res = await apiFetch(`/api/businesses/${businessId}/services`);
    if (!res.ok) throw new Error("Error al cargar servicios");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  getCatalog: async (businessId: string): Promise<CatalogCategory[]> => {
    const res = await apiFetch(`/api/businesses/${businessId}/catalog`);
    if (!res.ok) throw new Error("Error al cargar catálogo");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  createService: async (
    businessId: string,
    payload: { name: string; categoryId: string; duration: number; price: number; description?: string; requiresCabin?: boolean; requiresTherapist?: boolean; employeesCount?: number },
  ): Promise<Service> => {
    const res = await apiFetch(`/api/businesses/${businessId}/services`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al crear el servicio");
    return data;
  },

  updateService: async (
    businessId: string,
    serviceId: string,
    payload: Partial<{ name: string; categoryId: string; duration: number; price: number; description?: string; requiresCabin?: boolean; requiresTherapist?: boolean }>,
  ): Promise<Service> => {
    const res = await apiFetch(`/api/businesses/${businessId}/services/${serviceId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar el servicio");
    return data;
  },

  deleteService: async (businessId: string, serviceId: string): Promise<void> => {
    const res = await apiFetch(`/api/businesses/${businessId}/services/${serviceId}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404) throw new Error("Error al eliminar el servicio");
  },

  getAvailability: async (
    businessId: string,
    date: string,
    serviceId: string,
    smart = false,
  ): Promise<Slot[]> => {
    const params = new URLSearchParams({ date, serviceId });
    if (smart) params.set("smart", "1");
    const res = await apiFetch(
      `/api/businesses/${businessId}/availability?${params}`,
    );
    if (!res.ok) throw new Error("Error al cargar disponibilidad");
    const data = await res.json();
    return data.slots ?? [];
  },

  getOccupiedSlots: async (
    businessId: string,
    date: string,
    serviceId: string,
  ): Promise<Slot[]> => {
    const params = new URLSearchParams({ date, serviceId });
    const res = await apiFetch(
      `/api/businesses/${businessId}/occupied-slots?${params}`,
    );
    if (!res.ok) throw new Error("Error al cargar huecos ocupados");
    const data = await res.json();
    return data.slots ?? data ?? [];
  },

  createBooking: async (payload: {
    businessId: string;
    serviceId: string;
    start: string;
    end: string;
    discountPercent?: number;
  }) => {
    const res = await apiFetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al crear la reserva");
    }
    return data;
  },

  addToWaitlist: async (payload: {
    businessId: string;
    serviceId: string;
    preferredStart: string;
    preferredEnd: string;
  }): Promise<WaitlistEntry> => {
    const res = await apiFetch("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al apuntarse a la lista");
    return data;
  },

  getMyWaitlist: async (): Promise<WaitlistEntry[]> => {
    const res = await apiFetch("/api/waitlist");
    if (!res.ok) throw new Error("Error al cargar lista de espera");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  getMyNotifications: async (): Promise<WaitlistNotification[]> => {
    const res = await apiFetch("/api/waitlist/notifications");
    if (!res.ok) throw new Error("Error al cargar avisos");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await apiFetch(`/api/waitlist/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  getWaitlistByBusiness: async (): Promise<WaitlistEntryByBusiness[]> => {
    const res = await apiFetch("/api/waitlist/by-business");
    if (!res.ok) throw new Error("Error al cargar lista de espera del negocio");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  addClientToWaitlist: async (payload: {
    clientId: string;
    serviceId: string;
    preferredStart: string;
    preferredEnd: string;
  }): Promise<unknown> => {
    const res = await apiFetch("/api/waitlist/for-client", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Error al añadir a la lista");
    return data;
  },
};

export interface WaitlistEntryByBusiness {
  id: string;
  userId: string;
  businessId: string;
  serviceId: string;
  preferredStart: string;
  preferredEnd: string;
  createdAt: string;
  user: { name: string | null; username: string };
  service: { id: string; name: string };
}

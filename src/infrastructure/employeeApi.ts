import { apiFetch } from "./apiClient";

export interface EmployeeDto {
  id: string;
  name: string;
  photoUrl: string | null;
  linkedInUrl: string | null;
  phoneNumber: string | null;
  email: string | null;
  weeklyHours: number | null;
  color: string | null;
  role: string;
  businessId: string;
  defaultWorkStartHour: number | null;
  defaultWorkEndHour: number | null;
}

export const employeeApi = {
  getEmployees: async (): Promise<EmployeeDto[]> => {
    const res = await apiFetch("/api/employees");
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) {
      throw new Error(data.error ?? "No autorizado");
    }
    if (!res.ok) {
      throw new Error(data.error ?? "Error al cargar empleados");
    }
    return Array.isArray(data) ? data : [];
  },

  createEmployee: async (payload: Omit<EmployeeDto, "id" | "businessId">): Promise<EmployeeDto> => {
    const res = await apiFetch("/api/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al crear empleado");
    }
    return data as EmployeeDto;
  },

  updateEmployee: async (id: string, payload: Partial<Omit<EmployeeDto, "id" | "businessId">>): Promise<EmployeeDto> => {
    const res = await apiFetch(`/api/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "Error al actualizar empleado");
    }
    return data as EmployeeDto;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    const res = await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 204) {
      throw new Error(data.error ?? "Error al eliminar empleado");
    }
  },
};

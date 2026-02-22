import { defineStore } from "pinia";
import { ref } from "vue";
import type { TeamMember, TeamMemberRole } from "@/interfaces";
import { employeeApi, type EmployeeDto } from "@/infrastructure/employeeApi";
import { TEAM_MANAGER } from "@/data/constants";
import { INDEX_NOT_FOUND } from "@/data/constants";
import { generatePastelColor } from "@/utils/color";

const parseRole = (r: string): TeamMemberRole =>
  r === "admin" ? "admin" : "employee";

const dtoToMember = (d: EmployeeDto): TeamMember => ({
  id: d.id,
  name: d.name,
  photoUrl: d.photoUrl ?? "",
  linkedInUrl: d.linkedInUrl ?? undefined,
  phoneNumber: d.phoneNumber ?? (d as { phone?: string }).phone ?? "",
  email: d.email ?? "",
  weeklyHours: d.weeklyHours ?? 40,
  color: d.color ?? generatePastelColor(),
  role: parseRole(d.role),
  defaultWorkStartHour: d.defaultWorkStartHour ?? TEAM_MANAGER.DEFAULT_WORK_START_HOUR,
  defaultWorkEndHour: d.defaultWorkEndHour ?? TEAM_MANAGER.DEFAULT_WORK_END_HOUR,
});

const memberToPayload = (m: Partial<TeamMember> & { username?: string; password?: string }): Record<string, unknown> => ({
  name: m.name ?? "",
  photoUrl: m.photoUrl ?? null,
  linkedInUrl: m.linkedInUrl ?? null,
  phoneNumber: m.phoneNumber ?? null,
  email: m.email ?? null,
  username: m.username ?? undefined,
  password: m.password ?? undefined,
  weeklyHours: m.weeklyHours ?? null,
  color: m.color ?? null,
  role: m.role ?? "employee",
  defaultWorkStartHour: m.defaultWorkStartHour ?? null,
  defaultWorkEndHour: m.defaultWorkEndHour ?? null,
});

export const useTeamStore = defineStore("team", () => {
  const members = ref<TeamMember[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      const list = await employeeApi.getEmployees();
      members.value = list.map(dtoToMember);
    } catch {
      members.value = [];
    }
  };

  const clearMembers = async (): Promise<void> => {
    const toDelete = members.value.filter((m) => m.role !== "admin");
    for (const m of toDelete) {
      try {
        await employeeApi.deleteEmployee(m.id);
      } catch {
        // continue with rest
      }
    }
    members.value = members.value.filter((m) => m.role === "admin");
  };

  const addMember = async (member: Omit<TeamMember, "id" | "color"> & { color?: string; username?: string; password?: string }): Promise<void> => {
    const payload = memberToPayload({
      ...member,
      color: member.color || generatePastelColor(),
      username: member.username,
      password: member.password,
    });
    const created = await employeeApi.createEmployee(payload as Omit<EmployeeDto, "id" | "businessId">);
    members.value.push(dtoToMember(created));
  };

  const updateMember = async (id: string, updates: Partial<TeamMember>): Promise<void> => {
    const payload = memberToPayload(updates);
    const updated = await employeeApi.updateEmployee(id, payload as Partial<Omit<EmployeeDto, "id" | "businessId">>);
    const index = members.value.findIndex((m) => m.id === id);
    if (index !== INDEX_NOT_FOUND) {
      members.value[index] = dtoToMember(updated);
    }
  };

  const deleteMember = async (id: string): Promise<void> => {
    await employeeApi.deleteEmployee(id);
    members.value = members.value.filter((m) => m.id !== id);
  };

  const getMemberById = (id: string): TeamMember | undefined => {
    return members.value.find((m) => m.id === id);
  };

  const insertMember = async (member: Omit<TeamMember, "id"> & { id?: string }): Promise<void> => {
    const payload = memberToPayload(member);
    const created = await employeeApi.createEmployee(payload as Omit<EmployeeDto, "id" | "businessId">);
    members.value.push(dtoToMember(created));
  };

  return {
    members,
    initialize,
    addMember,
    insertMember,
    updateMember,
    deleteMember,
    clearMembers,
    getMemberById,
  };
});

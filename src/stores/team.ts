import { defineStore } from "pinia";
import { ref } from "vue";
import type { TeamMember } from "@/interfaces";
import { DEFAULT_TEAM_MEMBERS } from "@/data/teamMembers";
import { TEAM_MANAGER } from "@/data/constants";
import { INDEX_NOT_FOUND } from "@/data/constants";
import { generatePastelColor } from "@/utils/color";

const STORAGE_KEY = "team-members";

const normalizeRole = (r: string): "manager" | "member" =>
  r === "manager" ? "manager" : "member";

export const useTeamStore = defineStore("team", () => {
  const members = ref<TeamMember[]>([]);

  const persistMembers = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members.value));
  };

  const initialize = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as (TeamMember & { role?: string; therapistId?: string })[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          members.value = [];
          persistMembers();
          return;
        }
        const defaultsById = new Map(DEFAULT_TEAM_MEMBERS.map((m) => [m.id, m]));
        const cleanPhotoUrl = (url: string) =>
          url && !url.includes("randomfox.ca") ? url : "";
        members.value = parsed.map((t) => {
          const def = defaultsById.get(t.id);
          const role = normalizeRole(t.role ?? "member");
          const base = def
            ? {
                ...t,
                linkedInUrl: t.linkedInUrl ?? def.linkedInUrl,
                defaultWorkStartHour:
                  t.defaultWorkStartHour ?? def.defaultWorkStartHour ?? TEAM_MANAGER.DEFAULT_WORK_START_HOUR,
                defaultWorkEndHour:
                  t.defaultWorkEndHour ?? def.defaultWorkEndHour ?? TEAM_MANAGER.DEFAULT_WORK_END_HOUR,
              }
            : t;
          return { ...base, role, photoUrl: cleanPhotoUrl(base.photoUrl ?? "") } as TeamMember;
        });
        persistMembers();
      } catch (e) {
        console.error("Error parsing team from local storage", e);
        members.value = [];
        persistMembers();
      }
    } else {
      members.value = [];
      persistMembers();
    }
  };

  const clearMembers = () => {
    members.value = [];
    persistMembers();
  };

  const addMember = (member: Omit<TeamMember, "id" | "color"> & { color?: string }) => {
    const newMember: TeamMember = {
      ...member,
      id: crypto.randomUUID(),
      color: member.color || generatePastelColor(),
      role: "member",
      defaultWorkStartHour: member.defaultWorkStartHour ?? TEAM_MANAGER.DEFAULT_WORK_START_HOUR,
      defaultWorkEndHour: member.defaultWorkEndHour ?? TEAM_MANAGER.DEFAULT_WORK_END_HOUR,
    };
    members.value.push(newMember);
    persistMembers();
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    const index = members.value.findIndex((m) => m.id === id);
    if (index !== INDEX_NOT_FOUND) {
      members.value[index] = { ...members.value[index], ...updates };
      persistMembers();
    }
  };

  const deleteMember = (id: string) => {
    members.value = members.value.filter((m) => m.id !== id);
    persistMembers();
  };

  const getMemberById = (id: string) => {
    return members.value.find((m) => m.id === id);
  };

  const insertMember = (member: TeamMember) => {
    members.value.push(member);
    persistMembers();
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

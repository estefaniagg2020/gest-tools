import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTeamStore } from "@/stores/team";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { useToast } from "@/composables/useToast";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import type { TeamMember, WizardTeamMember } from "@/interfaces";
import { TEAM_MANAGER } from "@/data/constants";
import { getRandomAnimalAvatarUrl } from "@/utils/avatar";
import { generatePastelColor } from "@/utils/color";

export const syncWizardTeamMembers = async (wizardMembers: WizardTeamMember[]): Promise<void> => {
  const store = useTeamStore();
  await store.initialize();
  const byName = new Map(store.members.map((m) => [m.name.trim().toLowerCase(), m]));

  for (const wm of wizardMembers) {
    const name = wm.name?.trim() || "";
    if (!name) continue;
    const existing = byName.get(name.toLowerCase());
    if (existing) {
      if (existing.name !== wm.name) {
        await store.updateMember(existing.id, { name: wm.name });
      }
    } else {
      await store.insertMember({
        id: "",
        name: wm.name,
        specialty: wm.specialty || undefined,
        photoUrl: "",
        phoneNumber: "",
        email: "",
        weeklyHours: 40,
        color: generatePastelColor(),
        role: "member",
        defaultWorkStartHour: TEAM_MANAGER.DEFAULT_WORK_START_HOUR,
        defaultWorkEndHour: TEAM_MANAGER.DEFAULT_WORK_END_HOUR,
      });
    }
  }
};

export type TeamFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  weeklyHours: number;
  photoUrl: string;
  linkedInUrl: string | undefined;
  role: "member" | "manager";
  defaultWorkStartHour: number;
  defaultWorkEndHour: number;
  birthDate: string;
};

const getInitialForm = (): TeamFormState => ({
  name: "",
  email: "",
  phoneNumber: "",
  weeklyHours: 40,
  photoUrl: "",
  linkedInUrl: undefined,
  role: "member",
  defaultWorkStartHour: TEAM_MANAGER.DEFAULT_WORK_START_HOUR,
  defaultWorkEndHour: TEAM_MANAGER.DEFAULT_WORK_END_HOUR,
  birthDate: "",
});

export const useTeamManager = () => {
  const { t } = useI18n();
  const store = useTeamStore();
  const { show: showConfirm } = useConfirmDialog();
  const { addToast } = useToast();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive<TeamFormState>(getInitialForm());

  const orderedMembers = computed(() =>
    [...store.members].sort((a, b) => a.name.localeCompare(b.name)),
  );

  const resetForm = () => {
    Object.assign(form, getInitialForm());
  };

  const openCreateModal = () => {
    isEditing.value = false;
    editingId.value = null;
    resetForm();
    form.photoUrl = getRandomAnimalAvatarUrl();
    isModalOpen.value = true;
  };

  const editMember = (member: TeamMember) => {
    isEditing.value = true;
    editingId.value = member.id;
    form.name = member.name;
    form.email = member.email;
    form.phoneNumber = member.phoneNumber;
    form.weeklyHours = member.weeklyHours;
    form.photoUrl = member.photoUrl;
    form.linkedInUrl = member.linkedInUrl ?? "";
    form.role = member.role;
    form.defaultWorkStartHour = member.defaultWorkStartHour ?? TEAM_MANAGER.DEFAULT_WORK_START_HOUR;
    form.defaultWorkEndHour = member.defaultWorkEndHour ?? TEAM_MANAGER.DEFAULT_WORK_END_HOUR;
    form.birthDate = member.birthDate ?? "";
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const saveMember = async () => {
    const startH = form.defaultWorkStartHour;
    const endH = form.defaultWorkEndHour <= startH ? startH + 1 : form.defaultWorkEndHour;
    const payload = {
      ...form,
      linkedInUrl: form.linkedInUrl?.trim() || undefined,
      defaultWorkStartHour: startH,
      defaultWorkEndHour: Math.min(24, endH),
      birthDate: form.birthDate?.trim() || undefined,
    };
    try {
      if (isEditing.value && editingId.value) {
        await store.updateMember(editingId.value, payload);
      } else {
        await store.addMember(payload);
      }
      closeModal();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar";
      addToast(msg, "error");
    }
  };

  const deleteMember = async (id: string) => {
    const ok = await showConfirm({
      title: t("team.deleteConfirm").split("?")[0] + "?",
      message: t("team.deleteConfirm"),
      confirmLabel: "Eliminar",
      variant: "danger",
    });
    if (ok) {
      try {
        await store.deleteMember(id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al eliminar";
        addToast(msg, "error");
      }
    }
  };

  onMounted(async () => {
    await store.initialize();
    const gestorConfigStore = useGestorConfigStore();
    const configMembers = gestorConfigStore.teamMembers;
    if (store.members.length === 0 && configMembers.length > 0) {
      await syncWizardTeamMembers(configMembers);
    }
  });

  const clearMembers = async () => {
    try {
      await store.clearMembers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al limpiar equipo";
      addToast(msg, "error");
    }
  };

  return {
    orderedMembers,
    isModalOpen,
    isEditing,
    form,
    openCreateModal,
    editMember,
    closeModal,
    saveMember,
    deleteMember,
    clearMembers,
  };
};

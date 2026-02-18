import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTeamStore } from "@/stores/team";
import { useSpaStore } from "@/stores/spa";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import type { TeamMember, WizardTeamMember } from "@/interfaces";
import { TEAM_MANAGER } from "@/data/constants";
import { getRandomAnimalAvatarUrl } from "@/utils/avatar";
import { generatePastelColor } from "@/utils/color";

const DEFAULT_IDS_ORDER = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const syncWizardTeamMembers = (wizardMembers: WizardTeamMember[]) => {
  const store = useTeamStore();
  const existingIds = new Set(store.members.map((m) => m.id));

  for (const wm of wizardMembers) {
    if (existingIds.has(wm.id)) {
      const existing = store.members.find((m) => m.id === wm.id);
      if (existing && existing.name !== wm.name) {
        store.updateMember(wm.id, { name: wm.name });
      }
    } else {
      store.insertMember({
        id: wm.id,
        name: wm.name,
        specialty: wm.specialty || undefined,
        photoUrl: "",
        phoneNumber: "",
        email: "",
        weeklyHours: 40,
        color: generatePastelColor(),
        role: "member",
        spaId: "",
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
  spaId: string;
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
  spaId: "",
  defaultWorkStartHour: TEAM_MANAGER.DEFAULT_WORK_START_HOUR,
  defaultWorkEndHour: TEAM_MANAGER.DEFAULT_WORK_END_HOUR,
  birthDate: "",
});

export const useTeamManager = () => {
  const { t } = useI18n();
  const store = useTeamStore();
  const spaStore = useSpaStore();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive<TeamFormState>(getInitialForm());

  const orderedMembers = computed(() => {
    const orderIndex = new Map(DEFAULT_IDS_ORDER.map((id, i) => [id, i]));
    return [...store.members].sort((a, b) => {
      const ia = orderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const ib = orderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
  });

  const resetForm = () => {
    Object.assign(form, getInitialForm());
    form.spaId = spaStore.spas[0]?.id ?? "";
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
    form.spaId = member.spaId || (spaStore.spas[0]?.id ?? "");
    form.defaultWorkStartHour = member.defaultWorkStartHour ?? TEAM_MANAGER.DEFAULT_WORK_START_HOUR;
    form.defaultWorkEndHour = member.defaultWorkEndHour ?? TEAM_MANAGER.DEFAULT_WORK_END_HOUR;
    form.birthDate = member.birthDate ?? "";
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const saveMember = () => {
    if (!form.spaId && spaStore.spas.length > 0) {
      form.spaId = spaStore.spas[0].id;
    }
    const startH = form.defaultWorkStartHour;
    const endH = form.defaultWorkEndHour <= startH ? startH + 1 : form.defaultWorkEndHour;
    const payload = {
      ...form,
      linkedInUrl: form.linkedInUrl?.trim() || undefined,
      defaultWorkStartHour: startH,
      defaultWorkEndHour: Math.min(24, endH),
      birthDate: form.birthDate?.trim() || undefined,
    };
    if (isEditing.value && editingId.value) {
      store.updateMember(editingId.value, payload);
    } else {
      store.addMember(payload);
    }
    closeModal();
  };

  const deleteMember = (id: string) => {
    if (confirm(t("team.deleteConfirm"))) {
      store.deleteMember(id);
    }
  };

  const getLocationName = (id: string) => {
    const spa = spaStore.getSpaById(id);
    return spa ? spa.name : t("team.noAssignment");
  };

  onMounted(() => {
    store.initialize();
    spaStore.initialize();
    const gestorConfigStore = useGestorConfigStore();
    const configMembers = gestorConfigStore.teamMembers;
    if (store.members.length === 0 && configMembers.length > 0) {
      syncWizardTeamMembers(configMembers);
    }
  });

  const clearMembers = () => store.clearMembers();

  return {
    orderedMembers,
    isModalOpen,
    isEditing,
    form,
    spaStore,
    openCreateModal,
    editMember,
    closeModal,
    saveMember,
    deleteMember,
    clearMembers,
    getLocationName,
  };
};

import { ref, reactive, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { syncWizardTeamMembers } from "@/composables/useTeamManager";
import { useToast } from "@/composables/useToast";
import { DEFAULT_CONTACT_DATA } from "@/interfaces";
import type { WizardTeamMember } from "@/interfaces";

export const WIZARD_STEPS = [
  { id: "company", label: "Empresa" },
  { id: "activity", label: "Actividad" },
  { id: "team", label: "Equipo" },
  { id: "contact", label: "Contacto" },
  { id: "fiscal", label: "Fiscal y ubicación" },
] as const;

export const useConfigWizard = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const { user } = storeToRefs(authStore);
  const { addToast } = useToast();

  const currentStep = ref(1);
  const saving = ref(false);
  const saveError = ref("");
  const nextStepPending = ref(false);
  const prevStepPending = ref(false);
  const totalSteps = WIZARD_STEPS.length;

  const form = reactive({
    companyName: "",
    logoPreview: null as string | null,
    logoDataUrl: null as string | null,
    numberOfPeople: 1,
    businessType: "",
    contactData: { ...DEFAULT_CONTACT_DATA },
    teamMembers: [] as WizardTeamMember[],
    taxId: "",
    businessAddress: "",
    businessPopulation: "",
    isCanarias: false,
  });

  const syncFormFromStore = () => {
    const c = gestorConfigStore.getConfig();
    form.companyName = c.companyName;
    form.logoDataUrl = c.logoUrl;
    form.logoPreview = c.logoUrl;
    form.numberOfPeople = c.numberOfPeople;
    form.businessType = c.businessType;
    form.contactData = { ...DEFAULT_CONTACT_DATA, ...c.contactData };
    form.teamMembers = (c.teamMembers ?? []).map((m) => ({ ...m }));
    form.taxId = c.taxId ?? "";
    form.businessAddress = c.businessAddress ?? "";
    form.businessPopulation = c.businessPopulation ?? "";
    form.isCanarias = c.isCanarias ?? false;
  };

  const loadData = async () => {
    if (user.value?.id) {
      await gestorConfigStore.initialize(user.value.id, user.value.businessId ?? null);
    }
    syncFormFromStore();
  };

  onMounted(loadData);

  const onLogoChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      form.logoDataUrl = reader.result as string;
      form.logoPreview = form.logoDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) currentStep.value = step;
  };

  const goToNextStep = () => {
    if (currentStep.value >= totalSteps || nextStepPending.value) return;
    nextStepPending.value = true;
    currentStep.value += 1;
    nextTick(() => { nextStepPending.value = false; });
  };

  const goToPrevStep = () => {
    if (currentStep.value <= 1 || prevStepPending.value) return;
    prevStepPending.value = true;
    currentStep.value -= 1;
    nextTick(() => { prevStepPending.value = false; });
  };

  const addTeamMember = () => {
    form.teamMembers.push({ id: crypto.randomUUID(), name: "", specialty: "" });
  };

  const removeTeamMember = (idx: number) => {
    form.teamMembers.splice(idx, 1);
  };

  const buildConfigPayload = (complete: boolean) => {
    const validMembers = form.teamMembers.filter((m) => m.name.trim() !== "");
    const normalizedMembers = validMembers.map((m) => ({
      id: m.id,
      name: m.name.trim(),
      specialty: m.specialty.trim(),
    }));
    return {
      companyName: form.companyName.trim(),
      logoUrl: form.logoDataUrl,
      numberOfPeople: normalizedMembers.length || 1,
      businessType: form.businessType || "",
      contactData: {
        email: form.contactData.email.trim(),
        phone: form.contactData.phone.trim(),
        address: form.contactData.address?.trim() || "",
      },
      onboardingComplete: complete,
      teamMembers: normalizedMembers,
      taxId: form.taxId.trim() || undefined,
      businessAddress: form.businessAddress.trim() || undefined,
      businessPopulation: form.businessPopulation.trim() || undefined,
      isCanarias: form.isCanarias,
    };
  };

  const saveCurrentStep = async () => {
    if (!user.value) return;
    saveError.value = "";
    saving.value = true;
    try {
      const payload = buildConfigPayload(false);
      await gestorConfigStore.setConfig(user.value.id, payload, user.value.businessId ?? null);
      if (currentStep.value === 3) {
        try {
          await syncWizardTeamMembers(payload.teamMembers);
        } catch {
          addToast("No se pudieron sincronizar los miembros del equipo.", "error");
        }
      }
    } catch {
      saveError.value = "No se pudo guardar. Inténtalo de nuevo.";
    } finally {
      saving.value = false;
    }
  };

  const handleFinish = async () => {
    if (!user.value) return;
    saveError.value = "";
    saving.value = true;
    try {
      const payload = buildConfigPayload(true);
      await gestorConfigStore.setConfig(user.value.id, payload, user.value.businessId ?? null);
      try {
        await syncWizardTeamMembers(payload.teamMembers);
      } catch {
        addToast(
          "Configuración guardada, pero no se pudieron sincronizar los miembros del equipo. Revísalos en la vista Equipo.",
          "error",
        );
      }
      router.push({ name: "config" });
    } catch {
      saveError.value = "No se pudo guardar. Inténtalo de nuevo.";
    } finally {
      saving.value = false;
    }
  };

  return {
    form,
    currentStep,
    saving,
    saveError,
    totalSteps,
    steps: WIZARD_STEPS,
    goToStep,
    goToNextStep,
    goToPrevStep,
    addTeamMember,
    removeTeamMember,
    onLogoChange,
    saveCurrentStep,
    handleFinish,
  };
};

<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-10">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Configura tu gestor
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Completa los pasos para personalizar tu espacio.
        </p>
      </div>

      <div class="flex items-center justify-between gap-2 mb-8">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center flex-1 last:flex-none"
        >
          <button
            type="button"
            class="flex items-center gap-2 group cursor-pointer"
            :class="index + 1 <= currentStep ? 'opacity-100' : 'opacity-50'"
            @click="goToStep(index + 1)"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors"
              :class="
                index + 1 === currentStep
                  ? 'bg-brand-accent text-white ring-2 ring-brand-accent ring-offset-2'
                  : index + 1 < currentStep
                    ? 'bg-brand-accent/20 text-brand-accent'
                    : 'bg-gray-100 text-gray-400'
              "
            >
              {{ index + 1 }}
            </span>
            <span
              class="hidden sm:inline text-sm font-medium truncate"
              :class="index + 1 === currentStep ? 'text-gray-900' : 'text-gray-500'"
            >
              {{ step.label }}
            </span>
          </button>
          <div
            v-if="index < steps.length - 1"
            class="h-0.5 flex-1 mx-1 rounded overflow-hidden bg-gray-200 min-w-[8px]"
          >
            <div
              class="h-full rounded bg-brand-accent transition-all duration-300"
              :style="{ width: index + 1 < currentStep ? '100%' : '0%' }"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 sm:p-8">
          <!-- Step 1: Empresa + logo -->
          <div
            v-show="currentStep === 1"
            class="space-y-6"
          >
            <div>
              <label
                for="wizard-company"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                Nombre de la empresa
              </label>
              <input
                id="wizard-company"
                v-model="form.companyName"
                type="text"
                placeholder="Ej. Peluquería María"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
            <div>
              <span class="block text-sm font-semibold text-gray-800 mb-2">Logo</span>
              <div class="flex items-start gap-4">
                <div
                  class="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0"
                >
                  <img
                    v-if="form.logoPreview"
                    :src="form.logoPreview"
                    alt="Logo"
                    class="w-full h-full object-contain"
                  />
                  <span
                    v-else
                    class="text-3xl text-gray-400"
                  >
                    🖼
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-accent/10 file:text-brand-accent file:font-medium hover:file:bg-brand-accent/20 cursor-pointer"
                    @change="onLogoChange"
                  />
                  <button
                    v-if="form.logoPreview"
                    type="button"
                    class="mt-2 text-sm text-gray-500 hover:text-red-600 cursor-pointer"
                    @click="form.logoPreview = null; form.logoDataUrl = null"
                  >
                    Quitar logo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Actividad -->
          <div
            v-show="currentStep === 2"
            class="space-y-6"
          >
            <div>
              <label
                for="wizard-activity"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                ¿A qué se dedica tu empresa?
              </label>
              <select
                id="wizard-activity"
                v-model="form.businessType"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 transition-colors"
              >
                <option
                  value=""
                  disabled
                >
                  Selecciona la actividad
                </option>
                <option
                  v-for="opt in BUSINESS_TYPES"
                  :key="opt.id"
                  :value="opt.id"
                >
                  {{ opt.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500">
                Negocios que gestionan citas o agenda.
              </p>
            </div>
          </div>

          <!-- Step 3: Equipo -->
          <div
            v-show="currentStep === 3"
            class="space-y-5"
          >
            <div>
              <p class="text-sm text-gray-500">
                Añade las personas que forman tu equipo. Puedes indicar su especialidad si aplica.
              </p>
            </div>

            <div class="space-y-3">
              <div
                v-for="(member, idx) in form.teamMembers"
                :key="member.id"
                class="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50"
              >
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    v-model="member.name"
                    type="text"
                    :placeholder="`Nombre (ej. María López)`"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 placeholder-gray-400 text-sm transition-colors"
                  />
                  <input
                    v-model="member.specialty"
                    type="text"
                    placeholder="Especialidad (opcional)"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 placeholder-gray-400 text-sm transition-colors"
                  />
                </div>
                <button
                  type="button"
                  class="mt-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  :aria-label="`Eliminar miembro ${idx + 1}`"
                  @click="removeTeamMember(idx)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                class="flex items-center gap-2 text-sm font-medium text-brand-accent hover:text-brand-accent/80 transition-colors cursor-pointer"
                @click="addTeamMember"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Añadir persona
              </button>
            </div>

            <p
              v-if="form.teamMembers.length === 0"
              class="text-xs text-gray-400"
            >
              Puedes dejarlo vacío y añadir el equipo más adelante.
            </p>
          </div>

          <!-- Step 4: Datos de contacto -->
          <div
            v-show="currentStep === 4"
            class="space-y-6"
          >
            <div>
              <label
                for="wizard-email"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                Email de contacto
              </label>
              <input
                id="wizard-email"
                v-model="form.contactData.email"
                type="email"
                placeholder="contacto@tudominio.com"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
            <div>
              <label
                for="wizard-phone"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                Teléfono
              </label>
              <input
                id="wizard-phone"
                v-model="form.contactData.phone"
                type="tel"
                placeholder="+34 600 000 000"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
            <div>
              <label
                for="wizard-address"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                Dirección <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="wizard-address"
                v-model="form.contactData.address"
                type="text"
                placeholder="Calle, número, localidad"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>
        </div>

        <div class="px-6 sm:px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <BaseButton
              v-if="currentStep > 1"
              type="button"
              variant="outline"
              @click="goToPrevStep"
            >
              Atrás
            </BaseButton>
            <RouterLink
              to="/config"
              class="inline-flex"
            >
              <BaseButton variant="outline">
                Volver a configuración
              </BaseButton>
            </RouterLink>
          </div>
          <BaseButton
            v-if="currentStep < totalSteps"
            type="button"
            @click="goToNextStep"
          >
            Siguiente
          </BaseButton>
          <BaseButton
            v-else
            :disabled="saving"
            @click="handleFinish"
          >
            {{ saving ? "Guardando…" : "Finalizar" }}
          </BaseButton>
        </div>
      </div>

      <p
        v-if="saveError"
        class="mt-4 text-sm text-red-600"
      >
        {{ saveError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, nextTick } from "vue";
  import { useRouter } from "vue-router";
  import { storeToRefs } from "pinia";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import { syncWizardTeamMembers } from "@/composables/useTeamManager";
  import { BUSINESS_TYPES } from "@/data/businessTypes";
  import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_DATA } from "@/interfaces";
  import type { WizardTeamMember } from "@/interfaces";
  import BaseButton from "@/components/common/BaseButton.vue";

  const router = useRouter();
  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const { user } = storeToRefs(authStore);

  const currentStep = ref(1);
  const saving = ref(false);
  const saveError = ref("");

  const steps = [
    { id: "company", label: "Empresa" },
    { id: "activity", label: "Actividad" },
    { id: "team", label: "Equipo" },
    { id: "contact", label: "Contacto" },
  ];
  const totalSteps = steps.length;

  const form = reactive({
    companyName: "",
    logoPreview: null as string | null,
    logoDataUrl: null as string | null,
    numberOfPeople: 1,
    businessType: "",
    contactData: { ...DEFAULT_CONTACT_DATA },
    teamMembers: [] as WizardTeamMember[],
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
  };

  const addTeamMember = () => {
    form.teamMembers.push({ id: crypto.randomUUID(), name: "", specialty: "" });
  };

  const removeTeamMember = (idx: number) => {
    form.teamMembers.splice(idx, 1);
  };

  onMounted(syncFormFromStore);
  watch(user, syncFormFromStore, { immediate: true });

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

  const nextStepPending = ref(false);
  const goToNextStep = () => {
    if (currentStep.value >= totalSteps || nextStepPending.value) return;
    nextStepPending.value = true;
    const next = currentStep.value + 1;
    currentStep.value = next;
    nextTick(() => {
      nextStepPending.value = false;
    });
  };

  const prevStepPending = ref(false);
  const goToPrevStep = () => {
    if (currentStep.value <= 1 || prevStepPending.value) return;
    prevStepPending.value = true;
    const prev = currentStep.value - 1;
    currentStep.value = prev;
    nextTick(() => {
      prevStepPending.value = false;
    });
  };

  const handleFinish = async () => {
    if (!user.value) return;
    saveError.value = "";
    saving.value = true;
    try {
      const validMembers = form.teamMembers.filter((m) => m.name.trim() !== "");
      const normalizedMembers = validMembers.map((m) => ({
        id: m.id,
        name: m.name.trim(),
        specialty: m.specialty.trim(),
      }));
      gestorConfigStore.setConfig(user.value.id, {
        companyName: form.companyName.trim() || DEFAULT_COMPANY_NAME,
        logoUrl: form.logoDataUrl,
        numberOfPeople: normalizedMembers.length || 1,
        businessType: form.businessType || BUSINESS_TYPES[0].id,
        contactData: {
          email: form.contactData.email.trim(),
          phone: form.contactData.phone.trim(),
          address: form.contactData.address?.trim() || "",
        },
        onboardingComplete: true,
        teamMembers: normalizedMembers,
      });
      syncWizardTeamMembers(normalizedMembers);
      router.push({ name: "config" });
    } catch {
      saveError.value = "No se pudo guardar. Inténtalo de nuevo.";
    } finally {
      saving.value = false;
    }
  };
</script>

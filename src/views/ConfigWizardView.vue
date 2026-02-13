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
                  ? 'bg-spa-teal text-white ring-2 ring-spa-teal ring-offset-2'
                  : index + 1 < currentStep
                    ? 'bg-spa-teal/20 text-spa-teal'
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
              class="h-full rounded bg-spa-teal transition-all duration-300"
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
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 placeholder-gray-400 transition-colors"
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
                    class="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-spa-teal/10 file:text-spa-teal file:font-medium hover:file:bg-spa-teal/20 cursor-pointer"
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

          <!-- Step 2: Equipo (personas + tipo de negocio) -->
          <div
            v-show="currentStep === 2"
            class="space-y-6"
          >
            <div>
              <label
                for="wizard-business-type"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                Tipo de negocio
              </label>
              <select
                id="wizard-business-type"
                v-model="form.businessType"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 transition-colors"
              >
                <option
                  value=""
                  disabled
                >
                  Selecciona el tipo de negocio
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
            <div>
              <label
                for="wizard-people"
                class="block text-sm font-semibold text-gray-800 mb-2"
              >
                ¿Cuántas personas forman el equipo?
              </label>
              <input
                id="wizard-people"
                v-model.number="form.numberOfPeople"
                type="number"
                min="1"
                max="999"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 transition-colors"
              />
              <p class="mt-1 text-xs text-gray-500">
                Incluye a quien gestiona agendas o atiende citas.
              </p>
            </div>
          </div>

          <!-- Step 3: A qué se dedica -->
          <div
            v-show="currentStep === 3"
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
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 transition-colors"
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
            </div>
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
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 placeholder-gray-400 transition-colors"
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
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 placeholder-gray-400 transition-colors"
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
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>
        </div>

        <div class="px-6 sm:px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <BaseButton
            v-if="currentStep > 1"
            variant="outline"
            @click="currentStep--"
          >
            Atrás
          </BaseButton>
          <RouterLink
            v-else
            to="/config"
            class="inline-flex"
          >
            <BaseButton variant="outline">
              Volver a configuración
            </BaseButton>
          </RouterLink>
          <BaseButton
            v-if="currentStep < 4"
            @click="currentStep++"
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
  import { ref, reactive, onMounted, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import { BUSINESS_TYPES } from "@/data/businessTypes";
  import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_DATA } from "@/interfaces";
  import BaseButton from "@/components/common/BaseButton.vue";

  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const { user } = storeToRefs(authStore);

  const currentStep = ref(1);
  const saving = ref(false);
  const saveError = ref("");

  const steps = [
    { id: "company", label: "Empresa" },
    { id: "people", label: "Equipo" },
    { id: "business", label: "Actividad" },
    { id: "contact", label: "Contacto" },
  ];

  const form = reactive({
    companyName: "",
    logoPreview: null as string | null,
    logoDataUrl: null as string | null,
    numberOfPeople: 1,
    businessType: "",
    contactData: { ...DEFAULT_CONTACT_DATA },
  });

  const syncFormFromStore = () => {
    const c = gestorConfigStore.getConfig();
    form.companyName = c.companyName;
    form.logoDataUrl = c.logoUrl;
    form.logoPreview = c.logoUrl;
    form.numberOfPeople = c.numberOfPeople;
    form.businessType = c.businessType;
    form.contactData = { ...DEFAULT_CONTACT_DATA, ...c.contactData };
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
    if (step >= 1 && step <= 4) currentStep.value = step;
  };

  const handleFinish = async () => {
    if (!user.value) return;
    saveError.value = "";
    saving.value = true;
    try {
      gestorConfigStore.setConfig(user.value.id, {
        companyName: form.companyName.trim() || DEFAULT_COMPANY_NAME,
        logoUrl: form.logoDataUrl,
        numberOfPeople: Math.max(1, Math.min(999, form.numberOfPeople)) || 1,
        businessType: form.businessType || BUSINESS_TYPES[0].id,
        contactData: {
          email: form.contactData.email.trim(),
          phone: form.contactData.phone.trim(),
          address: form.contactData.address?.trim() || "",
        },
        onboardingComplete: true,
      });
    } catch {
      saveError.value = "No se pudo guardar. Inténtalo de nuevo.";
    } finally {
      saving.value = false;
    }
  };
</script>

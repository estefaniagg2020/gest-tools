<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <ConfigPageHeader
        :title="$t('configBilling.title')"
        :description="$t('configBilling.description')"
        :back-to="{ name: 'config' }"
        :back-label="$t('common.backToConfig')"
      />

      <div class="mt-8 space-y-8">
        <section class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">📋</span>
            {{ $t('configBilling.vatSectionTitle') }}
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            {{ $t('configBilling.vatSectionDesc') }}
          </p>
          <div v-if="loading" class="mt-4 text-sm text-app-text/60">
            {{ $t('common.loading') }}
          </div>
          <div v-else class="mt-4">
            <label class="block text-sm font-medium text-app-title mb-2">
              {{ $t('configBilling.defaultVatLabel') }}
            </label>
            <select
              v-model="defaultVatPercent"
              class="w-full max-w-xs p-2.5 bg-app-surface border border-app-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option
                v-for="opt in vatOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </section>

        <section class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">🛒</span>
            {{ $t('configBilling.cartSectionTitle') }}
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            {{ $t('configBilling.cartSectionDesc') }}
          </p>
          <div v-if="loading" class="mt-4 text-sm text-app-text/60">
            {{ $t('common.loading') }}
          </div>
          <div v-else class="mt-4">
            <ToggleSwitch
              v-model="cartEnabled"
              :label="$t('configBilling.cartEnabledLabel')"
            />
          </div>
        </section>

        <p v-if="saveError" class="text-sm text-amber-600">{{ saveError }}</p>
        <SaveButton
          :saving="saving"
          :success="saveSuccess"
          :disabled="loading"
          :label-save="$t('common.save')"
          :label-saving="$t('common.saving')"
          :label-saved="$t('common.savedShort')"
          @click="save"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { storeToRefs } from "pinia";
  import { useAuthStore } from "@/stores/auth";
  import { bookingApi } from "@/infrastructure/bookingApi";
  import { businessConfigApi } from "@/infrastructure/businessConfigApi";
  import ConfigPageHeader from "@/components/config/ConfigPageHeader.vue";
  import SaveButton from "@/components/common/SaveButton.vue";
  import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

  const VAT_OPTIONS = [
    { value: 0, label: "0% (exento)" },
    { value: 4, label: "4% (reducido)" },
    { value: 10, label: "10% (reducido)" },
    { value: 21, label: "21% (general)" },
  ] as const;

  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const loading = ref(true);
  const saving = ref(false);
  const saveError = ref("");
  const saveSuccess = ref(false);
  const defaultVatPercent = ref(21);
  const cartEnabled = ref(false);
  const businessIdRef = ref<string | null>(null);
  const vatOptions = VAT_OPTIONS;

  const resolveBusinessId = async (): Promise<string | null> => {
    const id = user.value?.businessId ?? null;
    if (id) return id;
    const list = await bookingApi.getBusinesses().catch(() => []);
    const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
    return first?.id ?? null;
  };

  onMounted(async () => {
    businessIdRef.value = await resolveBusinessId();
    if (businessIdRef.value) {
      try {
        const config = await businessConfigApi.getConfig(businessIdRef.value);
        if (config) {
          defaultVatPercent.value =
            typeof config.defaultVatPercent === "number" ? config.defaultVatPercent : 21;
          cartEnabled.value = config.cartEnabled ?? false;
        }
      } catch {
        // ignore
      }
    }
    loading.value = false;
  });

  const save = async () => {
    if (!businessIdRef.value) return;
    saveError.value = "";
    saveSuccess.value = false;
    saving.value = true;
    try {
      await businessConfigApi.updateConfig(businessIdRef.value, {
        defaultVatPercent: Number(defaultVatPercent.value),
        cartEnabled: cartEnabled.value,
      });
      saveSuccess.value = true;
    } catch (e) {
      saveError.value = e instanceof Error ? e.message : "Error al guardar";
    } finally {
      saving.value = false;
    }
  };
</script>

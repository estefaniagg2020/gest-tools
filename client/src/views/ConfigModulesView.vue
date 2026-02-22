<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <ConfigPageHeader
        :title="$t('configModules.title')"
        :description="$t('configModules.description')"
        :back-to="{ name: 'config' }"
        :back-label="$t('common.backToConfig')"
      />

      <div class="mt-8 space-y-8">
        <section class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">▦</span>
            {{ $t('configModules.sectionTitle') }}
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            {{ $t('configModules.sectionDesc') }}
          </p>
          <div v-if="loading" class="mt-4 text-sm text-app-text/60">
            {{ $t('common.loading') }}
          </div>
          <div v-else class="mt-4 space-y-3">
            <ToggleSwitch
              v-model="bonosEnabled"
              :label="$t('configModules.bonosEnabledLabel')"
            />
            <ToggleSwitch
              v-model="serviciosEnabled"
              :label="$t('configModules.serviciosEnabledLabel')"
            />
            <ToggleSwitch
              v-model="inventarioEnabled"
              :label="$t('configModules.inventarioEnabledLabel')"
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
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { businessConfigApi } from "@/infrastructure/businessConfigApi";
  import ConfigPageHeader from "@/components/config/ConfigPageHeader.vue";
  import SaveButton from "@/components/common/SaveButton.vue";
  import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const { load: loadBillingConfig } = useBillingConfig();
  const loading = ref(true);
  const saving = ref(false);
  const saveError = ref("");
  const saveSuccess = ref(false);
  const bonosEnabled = ref(false);
  const serviciosEnabled = ref(true);
  const inventarioEnabled = ref(false);
  const businessIdRef = ref<string | null>(null);

  onMounted(async () => {
    businessIdRef.value = user.value?.businessId ?? null;
    if (!businessIdRef.value) {
      saveError.value = "No hay negocio asociado al usuario actual.";
      loading.value = false;
      return;
    }
    if (businessIdRef.value) {
      try {
        const config = await businessConfigApi.getConfig(businessIdRef.value);
        if (config) {
          bonosEnabled.value = config.bonosEnabled ?? false;
          serviciosEnabled.value = config.serviciosEnabled ?? true;
          inventarioEnabled.value = config.inventarioEnabled ?? false;
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
        bonosEnabled: bonosEnabled.value,
        serviciosEnabled: serviciosEnabled.value,
        inventarioEnabled: inventarioEnabled.value,
      });
      saveSuccess.value = true;
      await loadBillingConfig();
    } catch (e) {
      saveError.value = e instanceof Error ? e.message : "Error al guardar";
    } finally {
      saving.value = false;
    }
  };
</script>

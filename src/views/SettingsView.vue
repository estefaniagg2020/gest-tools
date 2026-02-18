<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-2">{{ $t('settings.brandTitle') }}</h2>
      <p class="text-sm text-gray-500 mb-6">
        {{ $t('settings.brandDesc') }}
      </p>

      <form
        class="space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label
            for="settings-company-name"
            class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
          >
            {{ $t('common.companyName') }}
          </label>
          <input
            id="settings-company-name"
            v-model="form.companyName"
            type="text"
            :placeholder="$t('common.placeholderCompany')"
            class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            {{ $t('common.logo') }}
          </label>
          <div class="flex items-start gap-4">
            <div
              class="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0"
            >
              <img
                v-if="form.logoPreview"
                :src="form.logoPreview"
                alt="Logo"
                class="w-full h-full object-contain"
              />
              <span
                v-else
                class="text-2xl text-gray-400"
              >
                🖼
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <input
                type="file"
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-accent/10 file:text-brand-accent file:font-medium hover:file:bg-brand-accent/20 cursor-pointer"
                @change="onFileChange"
              />
              <p class="mt-1 text-xs text-gray-500">
                {{ $t('common.logoHint') }}
              </p>
              <button
                v-if="form.logoPreview"
                type="button"
                class="mt-2 text-xs text-gray-500 hover:text-red-600 cursor-pointer"
                @click="clearLogo"
              >
                {{ $t('common.removeLogo') }}
              </button>
            </div>
          </div>
        </div>

        <p
          v-if="success"
          class="text-sm text-green-600"
        >
          {{ $t('common.saved') }}
        </p>
        <p
          v-if="error"
          class="text-sm text-red-600"
        >
          {{ error }}
        </p>

        <BaseButton
          type="submit"
          :disabled="loading"
        >
          {{ loading ? $t('common.saving') : $t('common.save') }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from "vue";
  import { storeToRefs } from "pinia";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import BaseButton from "@/components/common/BaseButton.vue";

  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const { user } = storeToRefs(authStore);

  const loading = ref(false);
  const error = ref("");
  const success = ref(false);

  const form = reactive({
    companyName: "",
    logoPreview: null as string | null,
    logoDataUrl: null as string | null,
  });

  const syncFormFromStore = () => {
    const config = gestorConfigStore.getConfig();
    form.companyName = config.companyName;
    form.logoDataUrl = config.logoUrl;
    form.logoPreview = config.logoUrl;
  };

  onMounted(syncFormFromStore);

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      form.logoDataUrl = dataUrl;
      form.logoPreview = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    form.logoDataUrl = null;
    form.logoPreview = null;
  };

  const handleSubmit = () => {
    if (!user.value) return;
    error.value = "";
    success.value = false;
    loading.value = true;
    const current = gestorConfigStore.getConfig();
    gestorConfigStore.setConfig(user.value.id, {
      ...current,
      companyName: form.companyName.trim() || "Mi Gestor",
      logoUrl: form.logoDataUrl,
    });
    loading.value = false;
    success.value = true;
  };
</script>

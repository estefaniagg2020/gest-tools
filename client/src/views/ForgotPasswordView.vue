<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="flex items-center justify-center mb-8">
        <AppBrand
          size="lg"
          :show-subtitle="false"
        />
      </div>

      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
        <h2 class="text-lg font-bold text-gray-800 mb-1">{{ $t('auth.forgotPasswordTitle') }}</h2>
        <p class="text-sm text-gray-500 mb-6">
          {{ $t('auth.forgotPasswordHint') }}
        </p>

        <form
          v-if="!success"
          class="space-y-4"
          @submit.prevent="handleForgot"
        >
          <div>
            <label
              for="forgot-email"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              {{ $t('auth.email') }}
            </label>
            <input
              id="forgot-email"
              v-model="forgotForm.email"
              type="email"
              autocomplete="email"
              :placeholder="$t('auth.placeholderEmail')"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              for="forgot-new-password"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              {{ $t('auth.newPassword') }}
            </label>
            <input
              id="forgot-new-password"
              v-model="forgotForm.newPassword"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('auth.placeholderPasswordNew')"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              for="forgot-confirm"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              {{ $t('auth.confirmPassword') }}
            </label>
            <input
              id="forgot-confirm"
              v-model="forgotForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
            />
            <p
              v-if="error"
              class="mt-1 text-xs text-red-600"
            >
              {{ error }}
            </p>
          </div>

          <BaseButton
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? $t('auth.saving') : $t('auth.changePassword') }}
          </BaseButton>
        </form>

        <div
          v-else
          class="space-y-4"
        >
          <p class="text-sm text-gray-700">{{ $t('auth.passwordUpdated') }}</p>
          <BaseButton
            class="w-full"
            @click="router.push({ name: 'login' })"
          >
            {{ $t('auth.goToLogin') }}
          </BaseButton>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100">
          <RouterLink
            to="/login"
            class="text-sm text-brand-accent hover:underline"
          >
            {{ $t('auth.backToLogin') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import AppBrand from "@/components/common/AppBrand.vue";
  import BaseButton from "@/components/common/BaseButton.vue";

  const { t } = useI18n();
  const router = useRouter();
  const authStore = useAuthStore();

  const loading = ref(false);
  const error = ref("");
  const success = ref(false);

  const forgotForm = reactive({ email: "", newPassword: "", confirmPassword: "" });

  const handleForgot = async () => {
    error.value = "";
    if (!forgotForm.email.trim()) {
      error.value = t("auth.errorEmailRequired");
      return;
    }
    if (forgotForm.newPassword.length < 4) {
      error.value = t("auth.errorPasswordShort");
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      error.value = t("auth.errorPasswordMismatch");
      return;
    }
    loading.value = true;
    const result = await authStore.forgotPassword(forgotForm.email.trim(), forgotForm.newPassword);
    loading.value = false;
    if (result.ok) {
      success.value = true;
    } else {
      error.value = result.error;
    }
  };
</script>

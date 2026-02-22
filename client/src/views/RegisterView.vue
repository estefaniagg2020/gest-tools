<template>
  <div class="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="flex items-center justify-center mb-8">
        <AppBrand
          size="lg"
          :show-subtitle="false"
        />
      </div>

      <div class="bg-app-surface rounded-2xl shadow-card border border-app-border-subtle p-6 md:p-8">
        <h2 class="text-lg font-bold text-app-title mb-4">{{ $t('auth.createAccount') }}</h2>
        <p class="text-sm text-app-text/80 mb-6">
          {{ $t('auth.createAccountHint') }}
        </p>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="register-email"
              class="block text-xs font-bold text-app-text uppercase tracking-wider mb-2"
            >
              {{ $t('auth.email') }}
            </label>
            <input
              id="register-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              :placeholder="$t('auth.placeholderEmail')"
              class="w-full p-2.5 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-app-text/60"
            />
          </div>

          <div>
            <label
              for="register-username"
              class="block text-xs font-bold text-app-text uppercase tracking-wider mb-2"
            >
              {{ $t('auth.username') }}
            </label>
            <input
              id="register-username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              :placeholder="$t('auth.placeholderUsername')"
              class="w-full p-2.5 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-app-text/60"
            />
          </div>

          <div>
            <label
              for="register-password"
              class="block text-xs font-bold text-app-text uppercase tracking-wider mb-2"
            >
              {{ $t('auth.password') }}
            </label>
            <input
              id="register-password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('auth.placeholderPasswordNew')"
              class="w-full p-2.5 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-app-text/60"
            />
          </div>

          <div>
            <label
              for="register-confirm"
              class="block text-xs font-bold text-app-text uppercase tracking-wider mb-2"
            >
              {{ $t('auth.confirmPassword') }}
            </label>
            <input
              id="register-confirm"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              class="w-full p-2.5 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-app-text/60"
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
            {{ loading ? $t('auth.creating') : $t('auth.createAccountButton') }}
          </BaseButton>
        </form>

        <div class="mt-6 pt-4 border-t border-app-border-subtle">
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
  import { ref, reactive, onMounted } from "vue";
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

  const form = reactive({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  onMounted(() => {
    if (!authStore.hasAnyUser()) {
      router.replace({ name: "setup" });
    }
  });

  const handleSubmit = async () => {
    error.value = "";
    if (!form.email.trim()) {
      error.value = t("auth.errorEmailRequired");
      return;
    }
    if (!form.username.trim()) {
      error.value = t("auth.errorUsernameEmpty");
      return;
    }
    if (form.password.length < 4) {
      error.value = t("auth.errorPasswordShort");
      return;
    }
    if (form.password !== form.confirmPassword) {
      error.value = t("auth.errorPasswordMismatch");
      return;
    }
    loading.value = true;
    const result = await authStore.register(form.username, form.password, form.email.trim());
    loading.value = false;
    if (result.ok) {
      if (authStore.isClient) {
        router.push({ name: "reservar" });
      } else {
        router.push({ name: "dashboard" });
      }
    } else {
      error.value = result.error;
    }
  };
</script>

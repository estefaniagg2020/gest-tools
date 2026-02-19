<template>
  <div class="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="flex items-center justify-center mb-8">
        <AppBrand
          size="lg"
          :show-subtitle="false"
          :company-name-override="loginBranding?.companyName"
          :logo-url-override="loginBranding ? loginBranding.logoUrl : undefined"
        />
      </div>

      <div class="bg-app-surface rounded-2xl shadow-card border border-app-border-subtle p-6 md:p-8">
        <h2 class="text-lg font-bold text-app-title mb-6">{{ $t('auth.login') }}</h2>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="login-username"
              class="block text-xs font-bold text-app-text uppercase tracking-wider mb-2"
            >
              {{ $t('auth.username') }}
            </label>
            <input
              id="login-username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              :placeholder="$t('auth.placeholderUsername')"
              class="w-full p-2.5 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-app-text/60"
            />
          </div>

          <div>
            <label
              for="login-password"
              class="block text-xs font-bold text-app-text uppercase tracking-wider mb-2"
            >
              {{ $t('auth.password') }}
            </label>
            <div class="relative">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :placeholder="$t('auth.placeholderPassword')"
                class="w-full p-2.5 pr-10 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-app-text/60"
              />
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-app-text/60 hover:text-app-text rounded focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                :title="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
                :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
                @click="showPassword = !showPassword"
              >
                <span aria-hidden="true">{{ showPassword ? "🐵" : "🙈" }}</span>
              </button>
            </div>
            <p
              v-if="error"
              class="mt-1 text-xs text-red-600"
            >
              {{ error }}
            </p>
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              class="rounded border-app-border text-brand-accent focus:ring-brand-accent"
            />
            <span class="text-sm text-app-text">{{ $t('auth.rememberMe') }}</span>
          </label>

          <BaseButton
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? $t('auth.entering') : $t('auth.enter') }}
          </BaseButton>
        </form>

        <div class="mt-6 pt-4 border-t border-app-border-subtle space-y-2">
          <RouterLink
            to="/forgot-password"
            class="block text-sm text-brand-accent hover:underline"
          >
            {{ $t('auth.forgotPassword') }}
          </RouterLink>
          <RouterLink
            v-if="!authStore.hasAnyUser()"
            to="/setup"
            class="block text-sm text-app-text/80 hover:underline"
          >
            {{ $t('auth.createFirstAccount') }}
          </RouterLink>
        </div>
      </div>
      <div class="mt-8 flex justify-center">
        <BokioLogoSvg size="xl" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import { publicBrandingApi } from "@/infrastructure/publicBrandingApi";
  import AppBrand from "@/components/common/AppBrand.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import BokioLogoSvg from "@/components/common/BokioLogoSvg.vue";

  const { t } = useI18n();
  const router = useRouter();
  const authStore = useAuthStore();

  const loading = ref(false);
  const error = ref("");
  const showPassword = ref(false);
  const loginBranding = ref<{ companyName: string; logoUrl: string | null } | null>(null);

  onMounted(async () => {
    loginBranding.value = await publicBrandingApi.getBranding();
  });

  const form = reactive({
    username: "",
    password: "",
    rememberMe: true,
  });

  const handleSubmit = async () => {
    error.value = "";
    if (!form.username.trim()) {
      error.value = t("auth.errorUsername");
      return;
    }
    if (!form.password) {
      error.value = t("auth.errorPassword");
      return;
    }
    loading.value = true;
    const result = await authStore.login(form.username, form.password, form.rememberMe);
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

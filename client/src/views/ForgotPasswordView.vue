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
        <h2 class="text-lg font-bold text-gray-800 mb-2">He olvidado la contraseña</h2>
        <p class="text-sm text-gray-500 mb-6">
          Introduce tu usuario y una nueva contraseña. En esta versión la recuperación es local (mismo navegador).
        </p>

        <form
          v-if="!success"
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="forgot-username"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Usuario
            </label>
            <input
              id="forgot-username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="Tu usuario"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              for="forgot-new-password"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Nueva contraseña
            </label>
            <input
              id="forgot-new-password"
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 4 caracteres"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              for="forgot-confirm"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Repetir contraseña
            </label>
            <input
              id="forgot-confirm"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Repite la contraseña"
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
            {{ loading ? "Guardando…" : "Cambiar contraseña" }}
          </BaseButton>
        </form>

        <div
          v-else
          class="space-y-4"
        >
          <p class="text-sm text-gray-700">Contraseña actualizada. Ya puedes iniciar sesión.</p>
          <BaseButton
            class="w-full"
            @click="router.push({ name: 'login' })"
          >
            Ir a iniciar sesión
          </BaseButton>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100">
          <RouterLink
            to="/login"
            class="text-sm text-brand-accent hover:underline"
          >
            Volver al login
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import AppBrand from "@/components/common/AppBrand.vue";
  import BaseButton from "@/components/common/BaseButton.vue";

  const router = useRouter();
  const authStore = useAuthStore();

  const loading = ref(false);
  const error = ref("");
  const success = ref(false);

  const form = reactive({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    error.value = "";
    if (!form.username.trim()) {
      error.value = "Introduce tu usuario";
      return;
    }
    if (form.newPassword.length < 4) {
      error.value = "La contraseña debe tener al menos 4 caracteres";
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      error.value = "Las contraseñas no coinciden";
      return;
    }
    loading.value = true;
    const result = await authStore.forgotPassword(form.username, form.newPassword);
    loading.value = false;
    if (result.ok) {
      success.value = true;
    } else {
      error.value = result.error;
    }
  };
</script>

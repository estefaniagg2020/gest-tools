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
        <!-- Tabs -->
        <div class="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="mode === 'forgot'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="mode = 'forgot'; reset()"
          >
            Recuperar contraseña
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="mode === 'activate'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="mode = 'activate'; reset()"
          >
            Activar cuenta
          </button>
        </div>

        <!-- Forgot password mode -->
        <template v-if="mode === 'forgot'">
          <h2 class="text-lg font-bold text-gray-800 mb-1">He olvidado la contraseña</h2>
          <p class="text-sm text-gray-500 mb-6">
            Introduce tu usuario y una nueva contraseña.
          </p>

          <form
            v-if="!success"
            class="space-y-4"
            @submit.prevent="handleForgot"
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
                v-model="forgotForm.username"
                type="text"
                autocomplete="username"
                placeholder="Tu nombre de usuario"
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
                v-model="forgotForm.newPassword"
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
                v-model="forgotForm.confirmPassword"
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
        </template>

        <!-- Activate account mode -->
        <template v-else>
          <h2 class="text-lg font-bold text-gray-800 mb-1">Activar mi cuenta</h2>
          <p class="text-sm text-gray-500 mb-6">
            Si el administrador te ha dado de alta como empleado, introduce tu email, elige un usuario y una contraseña para acceder.
          </p>

          <form
            v-if="!success"
            class="space-y-4"
            @submit.prevent="handleActivate"
          >
            <div>
              <label
                for="activate-email"
                class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              >
                Email de empleado
              </label>
              <input
                id="activate-email"
                v-model="activateForm.email"
                type="email"
                autocomplete="email"
                placeholder="El email con el que te registraron"
                class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                for="activate-username"
                class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              >
                Nombre de usuario
              </label>
              <input
                id="activate-username"
                v-model="activateForm.username"
                type="text"
                autocomplete="username"
                placeholder="Elige un usuario para entrar"
                class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                for="activate-password"
                class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              >
                Contraseña
              </label>
              <input
                id="activate-password"
                v-model="activateForm.password"
                type="password"
                autocomplete="new-password"
                placeholder="Mínimo 4 caracteres"
                class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                for="activate-confirm"
                class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              >
                Repetir contraseña
              </label>
              <input
                id="activate-confirm"
                v-model="activateForm.confirmPassword"
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
              {{ loading ? "Activando…" : "Activar cuenta" }}
            </BaseButton>
          </form>

          <div
            v-else
            class="space-y-4"
          >
            <p class="text-sm text-green-700 font-medium">¡Cuenta activada! Entrando al gestor…</p>
          </div>
        </template>

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

  const mode = ref<"forgot" | "activate">("forgot");
  const loading = ref(false);
  const error = ref("");
  const success = ref(false);

  const forgotForm = reactive({ username: "", newPassword: "", confirmPassword: "" });
  const activateForm = reactive({ email: "", username: "", password: "", confirmPassword: "" });

  const reset = () => {
    error.value = "";
    success.value = false;
    loading.value = false;
  };

  const handleForgot = async () => {
    error.value = "";
    if (!forgotForm.username.trim()) { error.value = "Introduce tu usuario"; return; }
    if (forgotForm.newPassword.length < 4) { error.value = "La contraseña debe tener al menos 4 caracteres"; return; }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) { error.value = "Las contraseñas no coinciden"; return; }
    loading.value = true;
    const result = await authStore.forgotPassword(forgotForm.username, forgotForm.newPassword);
    loading.value = false;
    if (result.ok) {
      success.value = true;
    } else {
      error.value = result.error;
    }
  };

  const handleActivate = async () => {
    error.value = "";
    if (!activateForm.email.trim()) { error.value = "Introduce tu email de empleado"; return; }
    if (!activateForm.username.trim()) { error.value = "Elige un nombre de usuario"; return; }
    if (activateForm.password.length < 4) { error.value = "La contraseña debe tener al menos 4 caracteres"; return; }
    if (activateForm.password !== activateForm.confirmPassword) { error.value = "Las contraseñas no coinciden"; return; }
    loading.value = true;
    const result = await authStore.activateAccount(activateForm.email, activateForm.username, activateForm.password);
    loading.value = false;
    if (result.ok) {
      success.value = true;
      setTimeout(() => router.push({ name: "dashboard" }), 1200);
    } else {
      error.value = result.error;
    }
  };
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col">
    <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <RouterLink
        to="/reservar"
        class="text-sm text-brand-accent hover:underline"
      >
        Volver a reservar
      </RouterLink>
    </header>

    <main class="flex-1 p-4 max-w-md mx-auto w-full flex items-center justify-center">
      <div class="bg-white rounded-2xl border border-gray-100 p-6 w-full">
        <h2 class="text-lg font-bold text-gray-800 mb-2">Cambiar contraseña</h2>
        <p class="text-sm text-gray-500 mb-6">
          Introduce tu contraseña actual y la nueva contraseña.
        </p>

        <form
          v-if="!success"
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="current-password"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Contraseña actual
            </label>
            <input
              id="current-password"
              v-model="form.currentPassword"
              type="password"
              autocomplete="current-password"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label
              for="new-password"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Nueva contraseña
            </label>
            <input
              id="new-password"
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 4 caracteres"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label
              for="confirm-password"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Repetir contraseña
            </label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
          </div>
          <BaseButton
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? "Guardando…" : "Cambiar contraseña" }}
          </BaseButton>
        </form>

        <div v-else class="space-y-4">
          <p class="text-sm text-gray-700">Contraseña actualizada. Redirigiendo al login…</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/infrastructure/authApi";
import BaseButton from "@/components/common/BaseButton.vue";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref("");
const success = ref(false);

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const handleSubmit = async () => {
  error.value = "";
  if (!form.currentPassword) {
    error.value = "Introduce tu contraseña actual";
    return;
  }
  if (form.newPassword.length < 4) {
    error.value = "La nueva contraseña debe tener al menos 4 caracteres";
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    error.value = "Las contraseñas no coinciden";
    return;
  }
  loading.value = true;
  try {
    await authApi.changePassword(form.currentPassword, form.newPassword);
    success.value = true;
    await authStore.logout();
    router.push({ name: "login" });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Error al cambiar contraseña";
  } finally {
    loading.value = false;
  }
};
</script>

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
        <h2 class="text-lg font-bold text-gray-800 mb-2">Crear tu cuenta</h2>
        <p class="text-sm text-gray-500 mb-6">
          Configura el primer usuario para empezar a usar tu gestor.
        </p>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="setup-username"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Usuario
            </label>
            <input
              id="setup-username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="Elige un usuario"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spa-teal/20 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              for="setup-password"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Contraseña
            </label>
            <input
              id="setup-password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 4 caracteres"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spa-teal/20 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              for="setup-confirm"
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Repetir contraseña
            </label>
            <input
              id="setup-confirm"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Repite la contraseña"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spa-teal/20 placeholder:text-gray-400"
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
            {{ loading ? "Creando…" : "Crear cuenta" }}
          </BaseButton>
        </form>

        <div class="mt-6 pt-4 border-t border-gray-100">
          <RouterLink
            v-if="authStore.hasAnyUser()"
            to="/login"
            class="text-sm text-spa-teal hover:underline"
          >
            Ya tengo cuenta
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

  const form = reactive({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    error.value = "";
    if (!form.username.trim()) {
      error.value = "El usuario no puede estar vacío";
      return;
    }
    if (form.password.length < 4) {
      error.value = "La contraseña debe tener al menos 4 caracteres";
      return;
    }
    if (form.password !== form.confirmPassword) {
      error.value = "Las contraseñas no coinciden";
      return;
    }
    loading.value = true;
    const result = await authStore.register(form.username, form.password);
    loading.value = false;
    if (result.ok) {
      router.push({ name: "dashboard" });
    } else {
      error.value = result.error;
    }
  };
</script>

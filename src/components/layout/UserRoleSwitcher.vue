<template>
  <div>
    <button
      type="button"
      class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group cursor-pointer"
      :class="collapsed ? 'justify-center' : ''"
      @click="openModal"
    >
      <Avatar
        :name="displayName"
        :src="currentUserPhoto"
        :size="36"
        class="ring-2 ring-white shadow-sm"
      />
      <div
        class="overflow-hidden transition-all duration-300 text-left"
        :class="collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'"
      >
        <p class="text-sm font-bold text-gray-700">{{ displayName }}</p>
        <p class="text-xs text-gray-400 group-hover:text-spa-primary transition-colors">Cambiar Rol ⚡</p>
      </div>
    </button>

    <Modal
      :is-open="isModalOpen"
      @close="closeModal"
    >
      <template #title>Cambiar rol</template>
      <form
        id="role-form"
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"> Rol </label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.role"
                type="radio"
                value="manager"
                class="rounded-full border-gray-300 text-spa-teal focus:ring-spa-teal"
              />
              <span class="text-sm font-medium text-gray-700">Manager</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.role"
                type="radio"
                value="employee"
                class="rounded-full border-gray-300 text-spa-teal focus:ring-spa-teal"
              />
              <span class="text-sm font-medium text-gray-700">Empleado</span>
            </label>
          </div>
        </div>

        <div v-if="form.role === ROLE_EMPLOYEE">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            ¿Qué empleado eres?
          </label>
          <select
            v-model="form.employeeId"
            class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spa-teal/20"
            required
          >
            <option
              value=""
              disabled
            >
              Selecciona un empleado
            </option>
            <option
              v-for="t in therapists"
              :key="t.id"
              :value="t.id"
            >
              {{ t.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="role-password"
            class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
          >
            Contraseña
          </label>
          <input
            id="role-password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Introduce tu contraseña"
            class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spa-teal/20 placeholder:text-gray-400"
          />
          <p
            v-if="passwordError"
            class="mt-1 text-xs text-red-600"
          >
            {{ passwordError }}
          </p>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          @click="closeModal"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="role-form"
          class="px-4 py-2 bg-spa-teal text-white text-sm font-bold rounded-lg hover:bg-[#005a5d] transition-colors cursor-pointer"
        >
          Confirmar
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { useAuthStore } from "@/stores/auth";
  import { useTherapistStore } from "@/stores/therapist";
  import { AUTH_CONFIG } from "@/data/authConfig";
  import type { UserRole } from "@/stores/auth";
  import Avatar from "@/components/common/Avatar.vue";
  import Modal from "@/components/common/Modal.vue";

  defineProps<{
    collapsed?: boolean;
  }>();

  const authStore = useAuthStore();
  const therapistStore = useTherapistStore();
  const { currentRole, currentUserId } = storeToRefs(authStore);
  const { therapists } = storeToRefs(therapistStore);

  const ROLE_MANAGER = AUTH_CONFIG.ROLE_MANAGER;
  const ROLE_EMPLOYEE = AUTH_CONFIG.ROLE_EMPLOYEE;

  const displayName = computed(() => {
    if (currentRole.value === ROLE_MANAGER) return AUTH_CONFIG.MANAGER_DISPLAY_NAME;
    const therapist = therapists.value.find((t) => t.id === currentUserId.value);
    return therapist?.name ?? "Empleado";
  });

  const currentUserPhoto = computed(() => {
    if (currentRole.value === ROLE_MANAGER) return undefined;
    const therapist = therapists.value.find((t) => t.id === currentUserId.value);
    return therapist?.photoUrl;
  });

  const isModalOpen = ref(false);
  const passwordError = ref("");

  const form = ref({
    role: currentRole.value as UserRole,
    employeeId: currentUserId.value ?? "",
    password: "",
  });

  watch(isModalOpen, (open) => {
    if (open) {
      form.value = {
        role: currentRole.value as UserRole,
        employeeId: currentUserId.value ?? (form.value.role === ROLE_EMPLOYEE ? (therapists.value[0]?.id ?? "") : ""),
        password: "",
      };
      passwordError.value = "";
    }
  });

  watch(
    () => form.value.role,
    (role) => {
      if (role === ROLE_EMPLOYEE && !form.value.employeeId && therapists.value.length > 0) {
        form.value.employeeId = therapists.value[0].id;
      }
      if (role === ROLE_MANAGER) {
        form.value.employeeId = "";
      }
    },
  );

  const openModal = () => {
    therapistStore.initialize();
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const handleSubmit = () => {
    passwordError.value = "";
    if (form.value.password !== AUTH_CONFIG.DEMO_PASSWORD) {
      passwordError.value = "Contraseña incorrecta";
      return;
    }
    const role = form.value.role as UserRole;
    const userId = role === ROLE_MANAGER ? AUTH_CONFIG.MANAGER_USER_ID : form.value.employeeId || null;
    authStore.setUser(role, userId);
    closeModal();
  };
</script>

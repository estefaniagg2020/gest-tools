<template>
  <Modal
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <template #title>
      {{ isEditing ? THERAPIST_MANAGER.MODAL_TITLE_EDIT : THERAPIST_MANAGER.MODAL_TITLE_NEW }}
    </template>

    <form
      @submit.prevent="$emit('save')"
      class="space-y-4"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_NAME }}</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_EMAIL }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_PHONE }}</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_SPA }}</label>
        <select
          v-model="form.spaId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
        >
          <option
            v-for="spa in spas"
            :key="spa.id"
            :value="spa.id"
          >
            {{ spa.name }}
          </option>
        </select>
      </div>

      <div v-if="canEditRole">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_ROLE }}</label>
        <select
          v-model="form.role"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
        >
          <option value="manager">{{ THERAPIST_MANAGER.ROLE_MANAGER }}</option>
          <option value="therapist">{{ THERAPIST_MANAGER.ROLE_EMPLOYEE }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_LINKEDIN }}</label>
        <input
          v-model="form.linkedInUrl"
          type="url"
          :placeholder="THERAPIST_MANAGER.PLACEHOLDER_LINKEDIN"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_WEEKLY_HOURS }}</label>
          <input
            v-model.number="form.weeklyHours"
            type="number"
            min="1"
            max="168"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ THERAPIST_MANAGER.LABEL_PHOTO_URL }}</label>
          <input
            v-model="form.photoUrl"
            type="url"
            :placeholder="THERAPIST_MANAGER.PLACEHOLDER_PHOTO"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            THERAPIST_MANAGER.LABEL_DEFAULT_WORK_START
          }}</label>
          <select
            v-model.number="form.defaultWorkStartHour"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
          >
            <option
              v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            THERAPIST_MANAGER.LABEL_DEFAULT_WORK_END
          }}</label>
          <select
            v-model.number="form.defaultWorkEndHour"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
          >
            <option
              v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <BaseButton
          variant="ghost"
          type="button"
          class="w-full sm:w-auto"
          @click="$emit('close')"
        >
          {{ THERAPIST_MANAGER.BTN_CANCEL }}
        </BaseButton>
        <BaseButton
          type="submit"
          class="w-full sm:w-auto"
        >
          {{ isEditing ? THERAPIST_MANAGER.BTN_SAVE : THERAPIST_MANAGER.BTN_CREATE }}
        </BaseButton>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { Spa } from "@/interfaces";
  import type { TherapistFormState } from "@/composables/useTherapistManager";
  import Modal from "@/components/common/Modal.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import { useAuthStore } from "@/stores/auth";
  import { AUTH_CONFIG } from "@/data/authConfig";
  import { THERAPIST_MANAGER, SCHEDULE_VIEW_SETTINGS } from "@/data/constants";

  defineProps<{
    isOpen: boolean;
    isEditing: boolean;
    form: TherapistFormState;
    spas: Spa[];
  }>();

  defineEmits<{ close: []; save: [] }>();

  const authStore = useAuthStore();
  const canEditRole = computed(() => authStore.currentRole === AUTH_CONFIG.ROLE_MANAGER);
</script>

<template>
  <Modal
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <template #title>
      {{ isEditing ? $t('team.editMember') : $t('team.newMemberModal') }}
    </template>

    <form
      @submit.prevent="$emit('save')"
      class="space-y-4"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.fullName') }}</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
        />
      </div>

      <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.username') }}</label>
          <input
            v-model="form.username"
            type="text"
            autocomplete="username"
            :placeholder="$t('team.placeholderUsername')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            :placeholder="$t('team.placeholderPassword')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.phone') }}</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
          />
        </div>
      </div>

      <div v-if="canEditRole">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.role') }}</label>
        <select
          v-model="form.role"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
        >
          <option value="admin">{{ $t('team.manager') }}</option>
          <option value="employee">{{ $t('team.employee') }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.linkedinUrl') }}</label>
        <input
          v-model="form.linkedInUrl"
          type="url"
          :placeholder="$t('team.placeholderLinkedin')"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.weeklyHours') }}</label>
          <input
            v-model.number="form.weeklyHours"
            type="number"
            min="1"
            max="168"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.photoUrl') }}</label>
          <input
            v-model="form.photoUrl"
            type="url"
            :placeholder="$t('team.placeholderPhoto')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('team.birthDate') }}</label>
        <input
          v-model="form.birthDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
        />
        <p class="mt-1 text-xs text-gray-500">{{ $t('team.birthDateHint') }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('team.workStartHour')
          }}</label>
          <select
            v-model.number="form.defaultWorkStartHour"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
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
            $t('team.workEndHour')
          }}</label>
          <select
            v-model.number="form.defaultWorkEndHour"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
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
          {{ $t('common.cancel') }}
        </BaseButton>
        <BaseButton
          type="submit"
          class="w-full sm:w-auto"
          :disabled="isSaving"
        >
          {{ isSaving ? $t('common.loading') : (isEditing ? $t('team.saveChanges') : $t('team.createMember')) }}
        </BaseButton>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { TeamFormState } from "@/composables/useTeamManager";
  import Modal from "@/components/common/Modal.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import { useAuthStore } from "@/stores/auth";
  import { AUTH_CONFIG } from "@/data/authConfig";
  import { SCHEDULE_VIEW_SETTINGS } from "@/data/constants";

  defineProps<{
    isOpen: boolean;
    isEditing: boolean;
    isSaving?: boolean;
    form: TeamFormState;
  }>();

  defineEmits<{ close: []; save: [] }>();

  const authStore = useAuthStore();
  const canEditRole = computed(() => authStore.currentRole === AUTH_CONFIG.ROLE_MANAGER);
</script>

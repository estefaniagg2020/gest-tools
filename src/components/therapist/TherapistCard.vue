<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative min-w-0 flex flex-col h-[360px] w-full"
  >
    <div class="p-4 sm:p-6 flex flex-col items-center min-w-0 flex-1 min-h-0">
      <div
        class="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
      >
        <button
          type="button"
          @click="$emit('edit')"
          class="p-1.5 bg-gray-100 rounded-full text-gray-600 hover:text-spa-teal"
        >
          ✏️
        </button>
        <button
          type="button"
          @click="$emit('delete')"
          class="p-1.5 bg-gray-100 rounded-full text-red-400 hover:text-red-600"
        >
          🗑️
        </button>
      </div>

      <div class="flex flex-col items-center w-full shrink-0 min-h-[140px] sm:min-h-[160px]">
        <div class="relative mb-4 shrink-0">
          <Avatar
            :src="therapist.photoUrl"
            :name="therapist.name"
            :size="avatarSize"
            :href="therapist.linkedInUrl"
            class="shrink-0"
          />
          <span
            v-if="isManager"
            class="absolute -top-0.5 -right-0.5 text-lg leading-none"
            title="Manager"
            aria-hidden
          >
            {{ CROWN }}
          </span>
        </div>
        <h3
          class="text-lg font-bold text-gray-900 text-center w-full min-w-0 px-1 line-clamp-2"
          :title="therapist.name"
        >
          {{ therapist.name }}
        </h3>
        <div class="flex flex-col items-center gap-1 mt-1">
          <span
            class="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 justify-center"
            :class="isManager ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'"
          >
            <span
              v-if="isManager"
              aria-hidden
              >{{ CROWN }}</span
            >
            {{ roleLabel }}
          </span>
          <span
            v-if="therapist.spaId"
            class="text-[10px] font-medium px-2 py-0.5 bg-spa-teal/10 text-spa-teal rounded-full"
          >
            {{ spaName }}
          </span>
        </div>
      </div>

      <div class="w-full min-w-0 pt-4 mt-auto border-t border-gray-100 space-y-2 text-sm text-gray-600 shrink-0">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-spa-teal shrink-0">📧</span>
          <span
            class="truncate"
            :title="therapist.email"
            >{{ therapist.email }}</span
          >
        </div>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-spa-teal shrink-0">📱</span>
          <span
            class="truncate"
            :title="therapist.phoneNumber"
            >{{ therapist.phoneNumber }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <span class="text-spa-teal">⏱️</span> {{ therapist.weeklyHours }}{{ THERAPIST_MANAGER.HOURS_SUFFIX }}
        </div>
      </div>
    </div>
    <div
      class="h-2 w-full shrink-0"
      :style="{ backgroundColor: therapist.color }"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { Therapist } from "@/interfaces";
  import Avatar from "@/components/common/Avatar.vue";
  import { THERAPIST_MANAGER } from "@/data/constants";

  const props = defineProps<{
    therapist: Therapist;
    spaName: string;
  }>();

  defineEmits<{ edit: []; delete: [] }>();

  const CROWN = "\u{1F451}";
  const isManager = computed(() => props.therapist.role === "manager");

  const roleLabel = computed(() =>
    isManager.value ? THERAPIST_MANAGER.ROLE_MANAGER : THERAPIST_MANAGER.ROLE_THERAPIST,
  );

  const avatarSize = 72;
</script>

<template>
  <div
    class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
  >
    <div class="flex items-center gap-4">
      <div
        class="w-10 h-10 bg-gradient-to-tr from-spa-teal to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-spa-teal/20"
      >
        🌿
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">SpaGest</h1>
        <p class="text-xs text-gray-500">{{ currentDate }}</p>
      </div>
    </div>

    <AppNavLinks />

    <div class="flex items-center gap-4">
      <div class="relative group">
        <button
          class="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-full pr-3 transition-colors border border-transparent hover:border-gray-100"
        >
          <Avatar
            :name="currentUserName"
            :src="currentUserPhoto"
            :size="32"
          />
          <div class="text-left hidden sm:block">
            <p class="text-sm font-bold text-gray-700 leading-tight">{{ currentUserName }}</p>
            <p class="text-[10px] text-gray-500 uppercase">{{ currentRole }}</p>
          </div>
          <span class="text-xs text-gray-400">▼</span>
        </button>

        <div
          class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right"
        >
          <div class="text-xs font-bold text-gray-400 px-3 py-2 uppercase tracking-wider">Cambiar Usuario</div>

          <button
            @click="$emit('update:user', MANAGER_USER_ID)"
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            :class="currentUserId === MANAGER_USER_ID ? 'bg-teal-50/50' : ''"
          >
            <Avatar
              name="Antonio"
              :size="28"
            />
            <div>
              <p class="text-sm font-bold text-gray-700">Antonio</p>
              <p class="text-[10px] text-gray-500">Manager</p>
            </div>
          </button>

          <div class="h-px bg-gray-100 my-1"></div>

          <div class="max-h-48 overflow-y-auto custom-scrollbar">
            <button
              v-for="therapist in therapists"
              :key="therapist.id"
              @click="$emit('update:user', therapist.id)"
              class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              :class="currentUserId === therapist.id ? 'bg-teal-50/50' : ''"
            >
              <Avatar
                :name="therapist.name"
                :src="therapist.photoUrl"
                :size="28"
                :href="therapist.linkedInUrl"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-700 truncate">{{ therapist.name }}</p>
                <p class="text-[10px] text-gray-500">{{ therapist.role }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Avatar from "@/components/common/Avatar.vue";
  import AppNavLinks from "@/components/layout/AppNavLinks.vue";
  import type { DashboardHeaderProps } from "@/interfaces/components";
  import { AUTH_CONFIG } from "@/data/authConfig";

  const MANAGER_USER_ID = AUTH_CONFIG.MANAGER_USER_ID;

  defineProps<DashboardHeaderProps>();

  defineEmits<{
    (e: "update:user", userId: string): void;
  }>();
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 2px;
  }
</style>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-bold text-gray-800 text-lg">Equipo</h3>
      <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">{{ therapists.length }}</span>
    </div>

    <div class="p-3">
      <input
        type="text"
        placeholder="Buscar..."
        class="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-spa-teal/50 transition-colors"
      />
    </div>

    <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">
      <button
        v-for="therapist in therapists"
        :key="therapist.id"
        @click="$emit('select', therapist.id)"
        class="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group text-left"
        :class="
          selectedId === therapist.id
            ? 'bg-spa-teal/10 border border-spa-teal/20 shadow-sm'
            : 'hover:bg-gray-50 border border-transparent'
        "
      >
        <Avatar
          :name="therapist.name"
          :src="therapist.photoUrl"
          :size="40"
          :href="therapist.linkedInUrl"
          class="ring-2 ring-white shadow-sm"
        />
        <div class="flex-1 min-w-0">
          <div
            class="font-bold text-sm truncate"
            :class="selectedId === therapist.id ? 'text-spa-teal' : 'text-gray-700'"
          >
            {{ therapist.name }}
          </div>
          <div class="text-xs text-gray-400 truncate flex items-center gap-1">
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="therapist.role === 'manager' ? 'bg-spa-primary' : 'bg-spa-teal'"
            ></span>
            {{ therapist.role === "manager" ? "Manager" : "Terapeuta" }}
          </div>
        </div>
      </button>
    </div>

    <div class="p-4 border-t border-gray-100 bg-gray-50/50">
      <RouterLink
        to="/therapists"
        class="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-spa-teal hover:text-spa-teal transition-colors text-sm font-medium"
      >
        + Gestionar Equipo
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Therapist } from "@/interfaces";
  import Avatar from "../common/Avatar.vue";

  defineProps<{
    therapists: Therapist[];
    selectedId: string;
  }>();

  defineEmits(["select"]);
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }
</style>

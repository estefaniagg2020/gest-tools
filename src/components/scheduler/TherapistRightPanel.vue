<template>
  <div class="app-card flex flex-col h-full overflow-hidden">
    <div class="p-4 border-b border-app-border-subtle flex items-center justify-between">
      <h3 class="font-semibold text-app-title text-lg">Equipo</h3>
      <span class="bg-app-bg text-app-text text-xs px-2 py-1 rounded-full font-medium">{{ therapists.length }}</span>
    </div>

    <div class="p-3">
      <input
        type="text"
        placeholder="Buscar..."
        class="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-spa-primary/20 transition-colors"
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
            ? 'bg-spa-primary/10 border border-spa-primary/20 shadow-sm'
            : 'hover:bg-app-bg border border-transparent'
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
            class="font-semibold text-sm truncate"
            :class="selectedId === therapist.id ? 'text-spa-primary' : 'text-app-title'"
          >
            {{ therapist.name }}
          </div>
          <div class="text-xs text-app-text/80 truncate flex items-center gap-1">
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="therapist.role === 'manager' ? 'bg-spa-primary' : 'bg-spa-teal'"
            ></span>
            {{ therapist.role === "manager" ? "Manager" : roleEmployeeLabel }}
          </div>
        </div>
      </button>
    </div>

    <div class="p-4 border-t border-app-border-subtle bg-app-bg/50">
      <RouterLink
        to="/therapists"
        class="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-app-border text-app-text/80 hover:border-spa-primary hover:text-spa-primary transition-colors text-sm font-medium"
      >
        + Gestionar Equipo
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { Therapist } from "@/interfaces";
  import Avatar from "../common/Avatar.vue";
  import { useBusinessTerminology } from "@/composables/useBusinessTerminology";

  defineProps<{
    therapists: Therapist[];
    selectedId: string;
  }>();

  defineEmits(["select"]);

  const terminology = useBusinessTerminology();
  const roleEmployeeLabel = computed(() => terminology.value.roleEmployee);
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

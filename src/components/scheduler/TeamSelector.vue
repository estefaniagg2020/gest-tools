<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-brand-accent transition-colors shadow-sm min-w-[200px]"
    >
      <div
        v-if="selectedMember"
        class="flex items-center gap-3"
      >
        <Avatar
          :src="selectedMember.photoUrl"
          :name="selectedMember.name"
          :size="32"
          :href="selectedMember.linkedInUrl"
        />
        <span class="text-sm font-medium text-gray-700">{{ selectedMember.name }}</span>
      </div>
      <div
        v-else
        class="flex items-center gap-3"
      >
        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span class="text-gray-400 text-xs">?</span>
        </div>
        <span class="text-sm font-medium text-gray-400">Seleccionar</span>
      </div>
      <span class="ml-auto text-gray-400">▼</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div
        v-for="member in members"
        :key="member.id"
        @click="select(member)"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
      >
        <Avatar
          :src="member.photoUrl"
          :name="member.name"
          :size="32"
          :href="member.linkedInUrl"
        />
        <span class="text-sm text-gray-700">{{ member.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import Avatar from "../common/Avatar.vue";
  import type { TeamMember } from "@/interfaces";

  const props = defineProps<{
    members: TeamMember[];
    selectedId?: string;
  }>();

  const emit = defineEmits<{
    (e: "select", id: string): void;
  }>();

  const isOpen = ref(false);

  const selectedMember = ref<TeamMember | undefined>(props.members.find((m) => m.id === props.selectedId));

  const select = (m: TeamMember) => {
    selectedMember.value = m;
    emit("select", m.id);
    isOpen.value = false;
  };
</script>

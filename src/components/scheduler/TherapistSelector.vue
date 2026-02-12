<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-spa-teal transition-colors shadow-sm min-w-[200px]"
    >
      <div
        v-if="selectedTherapist"
        class="flex items-center gap-3"
      >
        <Avatar
          :src="selectedTherapist.photoUrl"
          :name="selectedTherapist.name"
          :size="32"
          :href="selectedTherapist.linkedInUrl"
        />
        <span class="text-sm font-medium text-gray-700">{{ selectedTherapist.name }}</span>
      </div>
      <div
        v-else
        class="flex items-center gap-3"
      >
        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span class="text-gray-400 text-xs">?</span>
        </div>
        <span class="text-sm font-medium text-gray-400">Seleccionar Terapeuta</span>
      </div>
      <span class="ml-auto text-gray-400">▼</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div
        v-for="therapist in therapists"
        :key="therapist.id"
        @click="select(therapist)"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
      >
        <Avatar
          :src="therapist.photoUrl"
          :name="therapist.name"
          :size="32"
          :href="therapist.linkedInUrl"
        />
        <span class="text-sm text-gray-700">{{ therapist.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import Avatar from "../common/Avatar.vue";
  import type { Therapist } from "@/interfaces";

  const props = defineProps<{
    therapists: Therapist[];
    selectedId?: string;
  }>();

  const emit = defineEmits<{
    (e: "select", id: string): void;
  }>();

  const isOpen = ref(false);

  const selectedTherapist = ref<Therapist | undefined>(props.therapists.find((t) => t.id === props.selectedId));

  const select = (t: Therapist) => {
    selectedTherapist.value = t;
    emit("select", t.id);
    isOpen.value = false;
  };
</script>

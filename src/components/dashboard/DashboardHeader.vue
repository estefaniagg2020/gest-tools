<template>
  <div
    class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
  >
    <div class="flex items-center gap-4">
      <AppBrand
        size="md"
        :show-name="false"
      />
      <div>
        <h1 class="text-xl font-bold text-gray-800">{{ displayCompanyName }}</h1>
        <p class="text-xs text-gray-500">{{ currentDate }}</p>
      </div>
    </div>

    <AppNavLinks />

    <div
      v-if="username"
      class="text-sm text-gray-600 truncate max-w-[120px] md:max-w-[180px]"
      :title="username"
    >
      {{ username }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { storeToRefs } from "pinia";
  import AppBrand from "@/components/common/AppBrand.vue";
  import AppNavLinks from "@/components/layout/AppNavLinks.vue";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";

  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const { user } = storeToRefs(authStore);
  const { displayCompanyName } = storeToRefs(gestorConfigStore);

  defineProps<{
    currentDate: string;
  }>();

  const username = computed(() => user.value?.username ?? "");
</script>

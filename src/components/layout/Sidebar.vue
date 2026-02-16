<template>
  <aside
    class="h-full py-4 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
    :class="[
      isCollapsed ? 'w-20' : 'w-72',
      sidebarPosition === 'right' ? 'pr-4 pl-0' : 'pl-4',
    ]"
  >
    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute w-6 h-6 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-spa-primary hover:scale-110 transition-all z-40 cursor-pointer top-12"
      :class="sidebarPosition === 'right' ? '-left-3' : '-right-3'"
    >
      <span class="text-[10px]">{{ isCollapsed ? (sidebarPosition === 'right' ? '◀' : '▶') : (sidebarPosition === 'right' ? '▶' : '◀') }}</span>
    </button>

    <div
      class="h-full bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100/80 flex flex-col relative overflow-hidden backdrop-blur-xl"
    >
      <div
        class="p-6 flex items-center gap-3 mb-2"
        :class="{ 'justify-center': isCollapsed }"
      >
        <AppBrand
          :show-name="!isCollapsed"
          show-subtitle
          subtitle="Tu gestor"
          size="md"
        />
      </div>

      <nav class="flex-1 min-h-0 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem
          v-for="mod in orderedModules"
          :key="mod.id"
          :to="mod.to"
          :icon="mod.icon"
          :label="mod.label"
          :collapsed="isCollapsed"
          :active-class="mod.activeClass"
        />
      </nav>

      <div class="p-3 mt-auto space-y-2">
        <div
          class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-transparent"
          :class="isCollapsed ? 'justify-center' : ''"
        >
          <span
            v-if="!isCollapsed"
            class="text-xs text-gray-500 truncate"
            :title="authStore.user?.username"
          >
            {{ authStore.user?.username }}
          </span>
          <button
            type="button"
            class="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer shrink-0"
            :title="isCollapsed ? 'Cerrar sesión' : ''"
            @click="handleLogout"
          >
            {{ isCollapsed ? "Salir" : "Cerrar sesión" }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import { useResolvedLayoutModules } from "@/composables/useResolvedModuleIcons";
  import AppBrand from "@/components/common/AppBrand.vue";
  import NavItem from "./NavItem.vue";

  defineProps<{
    sidebarPosition: "left" | "right" | "none";
  }>();

  const isCollapsed = ref(false);
  const authStore = useAuthStore();
  const router = useRouter();
  const orderedModules = useResolvedLayoutModules();

  const handleLogout = () => {
    authStore.logout();
    router.push({ name: "login" });
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #e5e7eb;
  }
</style>

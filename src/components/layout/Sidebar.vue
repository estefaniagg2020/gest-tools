<template>
  <aside
    class="h-full py-4 pl-4 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
    :class="isCollapsed ? 'w-20' : 'w-72'"
  >
    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute -right-3 top-12 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-spa-primary hover:scale-110 transition-all z-40 cursor-pointer"
    >
      <span class="text-[10px]">{{ isCollapsed ? "▶" : "◀" }}</span>
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

      <nav class="flex-1 px-3 space-y-8 overflow-y-auto custom-scrollbar">
        <div class="space-y-1">
          <div
            class="px-3 text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 transition-opacity duration-200"
            :class="isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'"
          >
            Principal
          </div>

          <NavItem
            to="/"
            icon="🏠"
            label="Inicio"
            :collapsed="isCollapsed"
          />
          <NavItem
            to="/scheduler"
            icon="📅"
            label="Agenda"
            :collapsed="isCollapsed"
            active-class="bg-orange-50 text-orange-600"
          />
        </div>

        <div class="space-y-1">
          <div
            class="px-3 text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 transition-opacity duration-200"
            :class="isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'"
          >
            Gestión
          </div>

          <NavItem
            to="/therapists"
            icon="👥"
            label="Equipo"
            :collapsed="isCollapsed"
            active-class="bg-teal-50 text-teal-600"
          />
          <NavItem
            to="/spas"
            icon="🏢"
            label="Centros Spa"
            :collapsed="isCollapsed"
            active-class="bg-blue-50 text-blue-600"
          />
          <NavItem
            to="/config"
            icon="⚙️"
            label="Configuración"
            :collapsed="isCollapsed"
            active-class="bg-gray-100 text-gray-700"
          />
        </div>
      </nav>

      <div class="p-3 mt-auto space-y-2">
        <UserRoleSwitcher :collapsed="isCollapsed" />
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
  import AppBrand from "@/components/common/AppBrand.vue";
  import NavItem from "./NavItem.vue";
  import UserRoleSwitcher from "./UserRoleSwitcher.vue";

  const isCollapsed = ref(false);
  const authStore = useAuthStore();
  const router = useRouter();

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

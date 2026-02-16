<template>
  <div class="flex h-screen bg-app-bg font-sans text-app-text relative transition-colors duration-200">
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
    ></div>

    <div
      class="flex flex-1 min-w-0 overflow-hidden"
      :class="layoutSidebarRight ? 'flex-row-reverse' : 'flex-row'"
    >
      <Sidebar
        v-show="showSidebar"
        :sidebar-position="sidebarPosition"
        class="z-50 transition-transform duration-300 fixed md:static"
        :class="[
          isMobileMenuOpen ? 'flex translate-x-0 shadow-2xl' : 'hidden md:flex translate-x-0',
        ]"
      />

      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header
          class="md:hidden bg-app-surface/90 backdrop-blur-md border-b border-spa-teal/20 p-4 flex items-center justify-between z-20 transition-colors duration-200"
        >
          <AppBrand
            size="sm"
            :show-subtitle="false"
          />
          <RouterLink
            v-if="isConfigArea"
            to="/config"
            class="p-2 text-app-text/80 rounded-lg hover:bg-spa-teal/10 transition-colors text-sm font-medium"
          >
            ← Config
          </RouterLink>
          <button
            v-else
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 text-app-text/80 rounded-lg hover:bg-spa-teal/10 transition-colors"
          >
            {{ isMobileMenuOpen ? "✕" : "☰" }}
          </button>
        </header>

        <nav
          v-if="showNavbarDesktop"
          class="hidden md:flex items-center gap-6 px-6 py-3 border-b border-spa-teal/10 bg-app-surface/50"
        >
          <RouterLink
            v-for="item in orderedNavItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 text-app-text/80 hover:text-spa-teal font-medium transition-colors"
          >
            <span>{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="flex-1 min-h-0 flex flex-col overflow-y-auto p-4 md:p-6 lg:p-8 bg-app-bg">
          <RouterView v-slot="{ Component }">
            <transition
              name="fade"
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from "vue";
  import { RouterView, useRoute, useRouter } from "vue-router";
  import { storeToRefs } from "pinia";
  import { useAuthStore } from "@/stores/auth";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import { useLayoutStore } from "@/stores/layout";
  import { useModuleIconsStore } from "@/stores/moduleIcons";
  import { useAgendaColorsStore } from "@/stores/agendaColors";
  import { useResolvedLayoutModules } from "@/composables/useResolvedModuleIcons";
  import { setFavicon } from "@/utils/favicon";
  import AppBrand from "@/components/common/AppBrand.vue";
  import Sidebar from "./Sidebar.vue";

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const layoutStore = useLayoutStore();
  const { user } = storeToRefs(authStore);
  const { displayLogoUrl } = storeToRefs(gestorConfigStore);
  const { sidebarPosition, showNavbar } = storeToRefs(layoutStore);

  const isConfigArea = computed(() => route.path.startsWith("/config"));
  const showSidebar = computed(
    () => !isConfigArea.value && layoutStore.showSidebar
  );
  const layoutSidebarRight = computed(() => sidebarPosition.value === "right");
  const showNavbarDesktop = computed(
    () => showNavbar.value && !isConfigArea.value
  );
  const orderedNavItems = computed(() =>
    resolvedLayoutModules.value.map((m) => ({
      to: m.to,
      icon: m.icon,
      label: m.label,
    }))
  );
  const isMobileMenuOpen = ref(false);

  const agendaColorsStore = useAgendaColorsStore();

  const resolvedLayoutModules = useResolvedLayoutModules();

  watch(
    user,
    (u) => {
      if (u) {
        gestorConfigStore.initialize(u.id);
        layoutStore.initialize(u.id);
        useModuleIconsStore().initialize(u.id);
        agendaColorsStore.initialize();
      }
    },
    { immediate: true }
  );

  watch(
    displayLogoUrl,
    (url) => setFavicon(url || null),
    { immediate: true }
  );

  onMounted(() => {
    router.afterEach(() => {
      isMobileMenuOpen.value = false;
    });
  });
</script>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>


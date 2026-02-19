<template>
  <div class="flex flex-col h-screen bg-app-bg font-sans text-app-text relative transition-colors duration-200">
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
    ></div>

    <div
      class="flex flex-1 min-h-0 min-w-0 overflow-hidden"
      :class="layoutSidebarRight ? 'flex-row-reverse' : 'flex-row'"
    >
      <div
        v-show="showSidebar"
        class="sidebar-column z-50 flex shrink-0 transition-transform duration-300 fixed md:static h-full"
        :class="[
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : 'hidden md:flex translate-x-0',
        ]"
      >
        <Sidebar :sidebar-position="sidebarPosition" />
      </div>

      <main class="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        <header
          class="layout-header shrink-0 md:hidden p-4 flex items-center justify-between z-20 transition-colors duration-200"
          :class="hasThemeSelected ? 'header-themed' : 'bg-(--chrome-surface) border-b border-(--chrome-border)'"
        >
          <AppBrand
            size="sm"
            :show-subtitle="false"
          />
          <RouterLink
            v-if="isConfigArea"
            to="/config"
            class="p-2 text-app-text/80 rounded-lg hover:bg-brand-accent/10 transition-colors text-sm font-medium"
          >
            ← {{ $t('nav.config') }}
          </RouterLink>
          <button
            v-else
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 text-app-text/80 rounded-lg hover:bg-brand-accent/10 transition-colors"
          >
            {{ isMobileMenuOpen ? "✕" : "☰" }}
          </button>
        </header>

        <nav
          v-if="showNavbarDesktop"
          class="shrink-0 flex md:hidden gap-2 px-4 py-3 overflow-x-auto border-b border-(--chrome-border) bg-(--chrome-surface) scrollbar-hide"
          :class="hasThemeSelected ? 'header-themed' : ''"
          :aria-label="$t('nav.aria')"
        >
          <RouterLink
            v-for="item in mobileNavItems"
            :key="item.to"
            :to="item.to"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            :class="isActiveNav(item.to)
              ? 'bg-brand-accent text-white shadow-sm'
              : 'bg-app-bg/80 text-app-text/80 hover:bg-app-border-subtle hover:text-app-title'"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div
          class="flex-1 min-h-0 flex flex-col overflow-y-auto bg-app-bg"
          :class="[
            showSidebar && !layoutSidebarRight && 'md:pl-4',
            showSidebar && layoutSidebarRight && 'md:pr-4',
          ]"
        >
          <nav
            v-if="showNavbarDesktop"
            class="layout-header shrink-0 hidden md:flex items-center gap-4 md:gap-4 lg:gap-6 px-4 md:px-5 lg:px-6 py-3"
            :class="hasThemeSelected ? 'header-themed' : 'border-b border-(--chrome-border) bg-(--chrome-surface)'"
          >
            <RouterLink
              v-for="item in orderedNavItems"
              :key="item.to"
              :to="item.to"
              :title="item.iconOnly ? item.label : undefined"
              class="flex items-center gap-2 text-app-text/80 hover:text-brand-accent font-medium transition-colors"
            >
              <span>{{ item.icon }}</span>
              <span v-if="!item.iconOnly">{{ item.label }}</span>
            </RouterLink>
          </nav>
          <div class="flex-1 min-h-0 min-w-0">
          <RouterView v-slot="{ Component, route: currentRoute }">
            <Suspense>
              <transition
                :key="currentRoute.path"
                name="fade"
                mode="out-in"
              >
                <component :is="Component" />
              </transition>
              <template #fallback>
                <div class="flex flex-1 min-h-48 items-center justify-center text-app-text/60 text-sm">
                  {{ $t('common.loading') }}
                </div>
              </template>
            </Suspense>
          </RouterView>
          </div>
        </div>
      </main>
    </div>

    <AppFooter />
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
  import { useThemeStore } from "@/stores/theme";
  import { DEFAULT_THEME_ID } from "@/data/themes";
  import { useResolvedLayoutModules } from "@/composables/useResolvedModuleIcons";
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { setFavicon } from "@/utils/favicon";
  import AppBrand from "@/components/common/AppBrand.vue";
  import AppFooter from "./AppFooter.vue";
  import Sidebar from "./Sidebar.vue";

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const layoutStore = useLayoutStore();
  const { user } = storeToRefs(authStore);
  const { displayLogoUrl, displayCompanyName } = storeToRefs(gestorConfigStore);
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
      iconOnly: m.iconOnly ?? false,
    }))
  );

  const mobileNavItems = computed(() =>
    resolvedLayoutModules.value
      .filter((m) => m.id !== "config")
      .map((m) => ({ to: m.to, icon: m.icon, label: m.label }))
  );

  const isActiveNav = (to: string) => {
    if (to === "/") return route.path === "/";
    return route.path.startsWith(to);
  };
  const isMobileMenuOpen = ref(false);

  const agendaColorsStore = useAgendaColorsStore();
  const themeStore = useThemeStore();
  const resolvedLayoutModules = useResolvedLayoutModules();

  const hasThemeSelected = computed(() => themeStore.themeId !== DEFAULT_THEME_ID);

  watch(
    user,
    async (u) => {
      if (u) {
        await gestorConfigStore.initialize(u.id, u.businessId ?? null);
        layoutStore.initialize(u.id);
        useModuleIconsStore().initialize(u.id);
        agendaColorsStore.initialize();
        useBillingConfig().load();
      }
    },
    { immediate: true }
  );

  watch(
    displayLogoUrl,
    (url) => setFavicon(url || null),
    { immediate: true }
  );

  watch(
    () => displayCompanyName.value,
    (name) => {
      const base = "Bokio";
      document.title = name ? `${name} – ${base}` : base;
    },
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


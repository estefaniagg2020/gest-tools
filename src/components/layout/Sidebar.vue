<template>
  <aside
    class="sidebar-aside h-full py-4 md:py-3 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
    :class="[
      isCollapsed ? 'w-20' : 'w-64 md:w-56 lg:w-72',
      sidebarPosition === 'right' ? 'pr-3 md:pr-2 pl-0' : 'pl-3 md:pl-2',
    ]"
  >
    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute w-6 h-6 rounded-full shadow-sm flex items-center justify-center hover:text-brand-accent hover:scale-110 transition-all z-40 cursor-pointer top-12 border-[var(--chrome-border)] bg-[var(--chrome-surface)] text-app-text/70"
      :class="sidebarPosition === 'right' ? '-left-3' : '-right-3'"
    >
      <span class="text-[10px]">{{ isCollapsed ? (sidebarPosition === 'right' ? '◀' : '▶') : (sidebarPosition === 'right' ? '▶' : '◀') }}</span>
    </button>

    <div
      class="sidebar-inner h-full shadow-xl flex flex-col relative overflow-hidden transition-colors duration-200 bg-[var(--chrome-surface)] border border-[var(--chrome-border)] rounded-2xl"
    >
<div
      class="p-6 md:p-4 flex items-center gap-3 mb-2"
        :class="{ 'justify-center': isCollapsed }"
      >
        <AppBrand
          :show-name="!isCollapsed"
          show-subtitle
          :subtitle="$t('nav.yourManager')"
          size="md"
        />
      </div>

      <nav class="flex-1 min-h-0 py-2 px-4 md:px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem
          v-for="mod in navModules"
          :key="mod.id"
          :to="mod.to"
          :icon="mod.icon"
          :label="mod.label"
          :collapsed="isCollapsed"
          :icon-only="mod.iconOnly ?? false"
          :active-class="mod.activeClass"
        />
      </nav>

      <div class="p-3 mt-auto space-y-2">
        <div
          class="flex items-center gap-2 rounded-lg p-1 bg-app-bg/50 border border-app-border-subtle"
          :class="isCollapsed ? 'flex-col' : 'flex-row'"
        >
          <div
            class="flex items-center gap-1"
            :class="isCollapsed ? 'flex-col' : 'flex-row'"
          >
            <button
              v-for="opt in colorModeOptions"
              :key="opt.value"
              type="button"
              class="flex items-center justify-center rounded-md p-1.5 transition-colors shrink-0"
              :class="colorMode === opt.value
                ? 'bg-brand-accent/20 text-brand-accent'
                : 'text-app-text/70 hover:bg-app-border-subtle hover:text-app-title'"
              :title="opt.label"
              @click="setColorMode(opt.value)"
            >
              <span class="text-sm" aria-hidden="true">{{ opt.icon }}</span>
            </button>
          </div>
          <RouterLink
            to="/config"
            class="flex items-center justify-center rounded-md p-1.5 text-app-text/70 hover:bg-app-border-subtle hover:text-app-title transition-colors shrink-0"
            :title="$t('nav.config')"
          >
            <span class="text-sm" aria-hidden="true">⚙️</span>
          </RouterLink>
        </div>
        <div
          class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-transparent"
          :class="isCollapsed ? 'justify-center' : ''"
        >
          <span
            v-if="!isCollapsed"
            class="text-xs text-app-text/70 truncate"
            :title="authStore.user?.username"
          >
            {{ authStore.user?.username }}
          </span>
          <button
            type="button"
            class="text-xs font-medium text-app-text/70 hover:text-red-600 transition-colors cursor-pointer shrink-0"
            :title="isCollapsed ? '' : $t('sidebar.logout')"
            @click="handleLogout"
          >
            {{ isCollapsed ? $t('sidebar.exit') : $t('sidebar.logout') }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { storeToRefs } from "pinia";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import { useThemeStore } from "@/stores/theme";
  import { useResolvedLayoutModules } from "@/composables/useResolvedModuleIcons";
  import AppBrand from "@/components/common/AppBrand.vue";
  import NavItem from "./NavItem.vue";

  defineProps<{
    sidebarPosition: "left" | "right" | "none";
  }>();

  const TABLET_MIN = 768;
  const TABLET_MAX = 1023;
  const isTabletViewport = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= TABLET_MIN && window.innerWidth <= TABLET_MAX;
  };
  const isCollapsed = ref(isTabletViewport());

  let resizeHandler: (() => void) | null = null;

  onMounted(() => {
    if (typeof window === "undefined") return;
    if (isTabletViewport()) isCollapsed.value = true;
    resizeHandler = () => {
      if (isTabletViewport()) isCollapsed.value = true;
    };
    window.addEventListener("resize", resizeHandler);
  });

  onUnmounted(() => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  });
  const authStore = useAuthStore();
  const themeStore = useThemeStore();
  const router = useRouter();
  const { colorMode } = storeToRefs(themeStore);
  const setColorMode = (mode: "light" | "dark" | "mixed") => themeStore.setColorMode(mode);
  const orderedModules = useResolvedLayoutModules();
  const navModules = computed(() => orderedModules.value.filter((m) => m.id !== "config"));

  const { t } = useI18n();
  const colorModeOptions = computed(() => [
    { value: "light" as const, label: t("sidebar.colorMode.light"), icon: "☀️" },
    { value: "dark" as const, label: t("sidebar.colorMode.dark"), icon: "🌙" },
    { value: "mixed" as const, label: t("sidebar.colorMode.mixed"), icon: "◐" },
  ]);

  const handleLogout = async () => {
    await authStore.logout();
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

<template>
  <div class="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 relative">
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
    ></div>

    <Sidebar
      class="z-50 transition-transform duration-300 fixed md:static"
      :class="[
        isMobileMenuOpen ? 'flex translate-x-0 shadow-2xl' : 'hidden md:flex translate-x-0',
        isDashboard ? 'md:hidden' : '',
      ]"
    />

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <header
        class="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between z-20"
      >
        <h1 class="text-xl font-bold text-gray-800">SpaGest</h1>
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {{ isMobileMenuOpen ? "✕" : "☰" }}
        </button>
      </header>

      <div class="flex-1 min-h-0 flex flex-col overflow-hidden p-4 md:p-6 lg:p-8">
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
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { RouterView, useRoute, useRouter } from "vue-router";
  import Sidebar from "./Sidebar.vue";

  const route = useRoute();
  const router = useRouter();
  const isDashboard = computed(() => route.path === "/");
  const isMobileMenuOpen = ref(false);

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

<style scoped>
  .router-link-active {
    background-color: var(--color-spa-teal);
  }
</style>

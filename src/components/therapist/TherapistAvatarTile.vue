<template>
  <div
    class="relative w-full h-full min-h-[140px] aspect-square"
    ref="tileRef"
  >
    <button
      type="button"
      class="w-full h-full min-h-0 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-100 bg-white shadow-sm active:bg-gray-50 min-w-0 overflow-visible"
      :style="{ borderTopColor: therapist.color, borderTopWidth: '3px' }"
      @click.stop="toggleMenu"
    >
      <div class="relative shrink-0">
        <Avatar
          :src="therapist.photoUrl"
          :name="therapist.name"
          :size="56"
          class="shrink-0"
        />
        <span
          v-if="isManager"
          class="absolute -top-0.5 -right-0.5 text-sm leading-none"
          title="Manager"
          aria-hidden
        >
          {{ CROWN }}
        </span>
      </div>
      <span
        class="h-11 shrink-0 w-full min-w-0 px-0.5 flex items-center justify-center"
        :title="therapist.name"
      >
        <span
          class="text-sm font-medium text-gray-800 text-center w-full min-w-0 line-clamp-2 leading-snug wrap-break-word"
        >
          {{ therapist.name }}
        </span>
      </span>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="menuOpen"
          class="fixed inset-0 z-40"
          @click.stop="menuOpen = false"
        />
      </Transition>
      <Transition name="dropdown">
        <div
          v-if="menuOpen && menuPosition"
          ref="menuRef"
          class="fixed z-50 min-w-[140px] py-1 bg-white rounded-lg shadow-lg border border-gray-200"
          :style="{
            left: menuPosition.x + 'px',
            top: menuPosition.y + 'px',
          }"
        >
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            @click.stop="onEdit"
          >
            <span aria-hidden>✏️</span>
            Editar
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            @click.stop="onDelete"
          >
            <span aria-hidden>🗑️</span>
            Eliminar
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import type { Therapist } from "@/interfaces";
  import Avatar from "@/components/common/Avatar.vue";

  const MENU_OFFSET = 4;
  const MENU_MIN_HEIGHT = 88;
  const CROWN = "\u{1F451}";

  const props = defineProps<{
    therapist: Therapist;
  }>();

  const isManager = computed(() => props.therapist.role === "manager");

  const emit = defineEmits<{ edit: []; delete: [] }>();

  const tileRef = ref<HTMLElement | null>(null);
  const menuRef = ref<HTMLElement | null>(null);
  const menuOpen = ref(false);
  const menuPosition = ref<{ x: number; y: number } | null>(null);

  const updateMenuPosition = () => {
    if (!tileRef.value) return;
    const rect = tileRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openBelow = spaceBelow >= MENU_MIN_HEIGHT;
    const menuWidth = 140;
    const centerX = rect.left + rect.width / 2;
    let left = centerX - menuWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    const top = openBelow ? rect.bottom + MENU_OFFSET : rect.top - MENU_OFFSET - MENU_MIN_HEIGHT;
    menuPosition.value = { x: left, y: top };
  };

  const toggleMenu = () => {
    if (menuOpen.value) {
      menuOpen.value = false;
      menuPosition.value = null;
      return;
    }
    updateMenuPosition();
    menuOpen.value = true;
  };

  const onEdit = () => {
    menuOpen.value = false;
    menuPosition.value = null;
    emit("edit");
  };

  const onDelete = () => {
    menuOpen.value = false;
    menuPosition.value = null;
    emit("delete");
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      menuOpen.value &&
      tileRef.value &&
      !tileRef.value.contains(target) &&
      menuRef.value &&
      !menuRef.value.contains(target)
    ) {
      menuOpen.value = false;
      menuPosition.value = null;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped>
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: opacity 0.15s ease;
  }
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
  }
</style>

<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <RouterLink
        to="/config"
        class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-app-text/70 hover:text-spa-teal transition-colors duration-200"
      >
        ← Volver a configuración
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-app-title transition-colors duration-200">
        Temas
      </h1>
      <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
        Elige cómo quieres ver tu gestor. El tema se guarda automáticamente y verás el cambio al instante.
      </p>

      <div class="mt-6">
        <button
          type="button"
          class="rounded-lg border border-spa-teal/40 bg-spa-teal/10 px-4 py-2 text-sm font-medium text-spa-teal transition-colors duration-200 hover:bg-spa-teal/20"
          @click="picker.applySystemColors()"
        >
          Usar colores del sistema
        </button>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ThemeCard
          v-for="option in picker.options"
          :key="option.id"
          :theme-id="option.id"
          :title="option.label"
          :description="option.description"
          :is-selected="picker.isSelected(option.id)"
          :preview-color="option.id === 'personalizado' ? primaryColor : undefined"
          @select="onSelectTheme(option.id)"
        />
      </div>

      <section
        v-if="picker.isCustomTheme()"
        ref="colorPickerRef"
        class="mt-10 rounded-2xl border border-spa-teal/20 bg-app-surface p-6 transition-colors duration-200"
      >
        <label class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-medium text-app-text transition-colors duration-200">Color principal</span>
          <input
            type="color"
            :value="primaryColor"
            class="h-12 w-12 cursor-pointer rounded-xl border-2 border-spa-teal/30 bg-transparent"
            @input="onMainColorInput(($event.target as HTMLInputElement).value)"
          />
        </label>
      </section>

      <section class="mt-10 rounded-2xl border border-spa-teal/20 bg-app-surface p-6 transition-colors duration-200">
        <h3 class="text-base font-semibold text-app-title transition-colors duration-200">
          Tonos para títulos y textos
        </h3>
        <p class="mt-0.5 text-sm text-app-text/70 transition-colors duration-200">
          Color de los encabezados y del texto normal. Aplica a cualquier tema.
        </p>
        <div class="mt-4 flex flex-wrap gap-6">
          <label
            v-for="item in textColorFields"
            :key="item.key"
            class="flex flex-col items-center gap-2"
          >
            <span class="text-sm font-medium text-app-text transition-colors duration-200">{{ item.label }}</span>
            <input
              type="color"
              :value="item.key === 'title' ? picker.displayTitleColor : picker.displayTextColor"
              class="h-12 w-12 cursor-pointer rounded-xl border-2 border-spa-teal/30 bg-transparent"
              @input="onTitleTextInput(item.key, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, nextTick } from "vue";
  import { useThemePicker } from "@/composables/useThemePicker";
  import ThemeCard from "@/components/config/ThemeCard.vue";
  import { CUSTOM_THEME_ID } from "@/data/themes";
  import { useThemeStore } from "@/stores/theme";

  const picker = useThemePicker();
  const themeStore = useThemeStore();
  const colorPickerRef = ref<HTMLElement | null>(null);

  const textColorFields: { key: "title" | "text"; label: string }[] = [
    { key: "title", label: "Títulos" },
    { key: "text", label: "Texto" },
  ];

  const primaryColor = computed(
    () => (picker.customColors as { value: { primary: string } }).value?.primary ?? "#017074"
  );

  const onSelectTheme = (id: string) => {
    picker.setTheme(id);
  };

  watch(
    () => themeStore.themeId,
    (id) => {
      if (id === CUSTOM_THEME_ID) {
        nextTick(() => {
          colorPickerRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  );

  const onMainColorInput = (value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      picker.setCustomColors({ primary: value, accent: value });
    }
  };

  const onTitleTextInput = (key: "title" | "text", value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) picker.setTitleTextOverride(key, value);
  };
</script>

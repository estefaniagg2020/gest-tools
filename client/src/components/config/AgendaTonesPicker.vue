<template>
  <section
    ref="sectionRef"
    class="mt-8 rounded-xl border border-app-border-subtle bg-brand-accent/5 p-4"
  >
    <p class="text-[11px] text-app-text/70 mb-3">
      Tonos de la agenda. Elige primario (trabajo) y secundario (vacaciones).
    </p>
    <div class="flex flex-wrap items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-medium text-app-title w-14 shrink-0">Primario</span>
        <div class="flex gap-0.5">
          <button
            v-for="hex in primarySwatches"
            :key="'p-' + hex"
            type="button"
            class="h-5 w-5 rounded border border-white/70 shadow-sm shrink-0 hover:scale-110 transition-transform"
            :style="{ backgroundColor: hex }"
            :aria-label="hex"
            @click="$emit('update:primary', hex)"
          />
        </div>
        <input
          type="color"
          :value="primaryColor"
          class="h-6 w-6 cursor-pointer rounded border border-app-border-subtle bg-transparent"
          @input="onPrimaryInput(($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-medium text-app-title w-14 shrink-0">Secundario</span>
        <div class="flex gap-0.5">
          <button
            v-for="hex in secondarySwatches"
            :key="'s-' + hex"
            type="button"
            class="h-5 w-5 rounded border border-white/70 shadow-sm shrink-0 hover:scale-110 transition-transform"
            :style="{ backgroundColor: hex }"
            :aria-label="hex"
            @click="$emit('update:secondary', hex)"
          />
        </div>
        <input
          type="color"
          :value="secondaryColor"
          class="h-6 w-6 cursor-pointer rounded border border-app-border-subtle bg-transparent"
          @input="onSecondaryInput(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  defineProps<{
    primaryColor: string;
    secondaryColor: string;
    primarySwatches: string[];
    secondarySwatches: string[];
  }>();

  const emit = defineEmits<{
    "update:primary": [value: string];
    "update:secondary": [value: string];
  }>();

  const sectionRef = ref<HTMLElement | null>(null);

  const onPrimaryInput = (value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) emit("update:primary", value);
  };

  const onSecondaryInput = (value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) emit("update:secondary", value);
  };

  defineExpose({ sectionRef });
</script>

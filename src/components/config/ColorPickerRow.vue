<template>
  <div>
    <label class="text-sm text-app-text/70 block mb-1">{{ label }}</label>
    <div class="flex items-center gap-2">
      <input
        type="color"
        :value="value"
        @input="onColorInput"
        class="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 bg-transparent"
      />
      <input
        type="text"
        :value="value"
        @input="onTextInput"
        class="flex-1 min-w-0 p-2 rounded-xl border border-gray-200 text-sm font-mono"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { HEX_REGEX } from "@/interfaces/agendaColors";

  defineProps<{
    label: string;
    value: string;
  }>();

  const emit = defineEmits<{
    (e: "input", value: string): void;
  }>();

  const onColorInput = (e: Event) => {
    const v = (e.target as HTMLInputElement).value;
    if (HEX_REGEX.test(v)) emit("input", v);
  };

  const onTextInput = (e: Event) => {
    const v = (e.target as HTMLInputElement).value.trim();
    if (HEX_REGEX.test(v)) emit("input", v);
  };
</script>

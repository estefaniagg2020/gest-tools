<template>
  <div class="relative">
    <input
      ref="inputRef"
      type="text"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      autocomplete="off"
      class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-60"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.down.prevent="highlightNext"
      @keydown.up.prevent="highlightPrev"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.escape="isOpen = false"
    />
    <div
      v-show="isOpen && filteredOptions.length > 0"
      class="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1"
    >
      <button
        v-for="(opt, idx) in filteredOptions"
        :key="opt.value"
        type="button"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        :class="{ 'bg-gray-100': idx === highlightedIndex }"
        @mousedown.prevent="selectOption(opt)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, unref } from "vue";

  export interface SearchableOption {
    value: string;
    label: string;
  }

  const props = withDefaults(
    defineProps<{
      modelValue: string;
      options: SearchableOption[] | import("vue").Ref<SearchableOption[] | undefined>;
      placeholder?: string;
      emptyOptionLabel?: string;
      disabled?: boolean;
    }>(),
    { placeholder: "Buscar...", emptyOptionLabel: "", disabled: false },
  );

  const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

  const inputRef = ref<HTMLInputElement | null>(null);
  const isOpen = ref(false);
  const query = ref("");
  const highlightedIndex = ref(0);

  const optionsList = computed(() => unref(props.options) ?? []);

  const sortedOptions = computed(() => {
    const list = [...optionsList.value];
    if (props.emptyOptionLabel) {
      list.unshift({ value: "", label: props.emptyOptionLabel });
    }
    return list.sort((a, b) => {
      if (a.value === "") return -1;
      if (b.value === "") return 1;
      return a.label.localeCompare(b.label, "es");
    });
  });

  const filteredOptions = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return sortedOptions.value;
    return sortedOptions.value.filter((opt) =>
      opt.label.toLowerCase().includes(q),
    );
  });

  const displayValue = computed(() => {
    if (query.value) return query.value;
    const opt = optionsList.value.find((o) => o.value === props.modelValue);
    return opt?.label ?? "";
  });

  watch(
    () => props.modelValue,
    () => {
      const opt = optionsList.value.find((o) => o.value === props.modelValue);
      query.value = opt ? opt.label : "";
    },
    { immediate: true },
  );

  watch(
    () => filteredOptions.value.length,
    () => {
      highlightedIndex.value = 0;
    },
  );

  const onFocus = () => {
    query.value = "";
    isOpen.value = true;
  };

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    query.value = target.value;
    isOpen.value = true;
    if (!query.value) {
      emit("update:modelValue", "");
    }
  };

  const onBlur = () => {
    setTimeout(() => {
      isOpen.value = false;
      const opt = optionsList.value.find((o: SearchableOption) => o.value === props.modelValue);
      query.value = opt ? opt.label : "";
    }, 150);
  };

  const selectOption = (opt: SearchableOption) => {
    emit("update:modelValue", opt.value);
    query.value = opt.label;
    isOpen.value = false;
  };

  const highlightNext = () => {
    highlightedIndex.value = Math.min(
      highlightedIndex.value + 1,
      filteredOptions.value.length - 1,
    );
  };

  const highlightPrev = () => {
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
  };

  const selectHighlighted = () => {
    const opt = filteredOptions.value[highlightedIndex.value];
    if (opt) selectOption(opt);
  };
</script>

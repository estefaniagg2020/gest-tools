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
      @focus="isOpen = true"
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
  import type { SearchableOption } from "./SearchableSelect.vue";

  const props = withDefaults(
    defineProps<{
      clientId: string;
      clientName: string;
      options: SearchableOption[] | import("vue").Ref<SearchableOption[] | undefined>;
      placeholder?: string;
      emptyOptionLabel?: string;
      disabled?: boolean;
    }>(),
    { placeholder: "Buscar cliente o escribir nombre...", emptyOptionLabel: "", disabled: false },
  );

  const emit = defineEmits<{
    (e: "update:clientId", value: string): void;
    (e: "update:clientName", value: string): void;
  }>();

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
    return list.sort((optionA, optionB) => {
      if (optionA.value === "") return -1;
      if (optionB.value === "") return 1;
      return optionA.label.localeCompare(optionB.label, "es");
    });
  });

  const filteredOptions = computed(() => {
    const searchQuery = query.value.trim().toLowerCase();
    if (!searchQuery) return sortedOptions.value;
    return sortedOptions.value.filter((option) =>
      option.label.toLowerCase().includes(searchQuery),
    );
  });

  const displayValue = computed(() => {
    if (query.value) return query.value;
    if (props.clientId) {
      const option = optionsList.value.find((opt) => opt.value === props.clientId);
      if (option) return option.label;
    }
    if (props.clientName) return props.clientName;
    if (props.emptyOptionLabel) return props.emptyOptionLabel;
    return "";
  });

  watch(
    () => [props.clientId, props.clientName],
    () => {
      if (props.clientId) {
        const option = optionsList.value.find((opt) => opt.value === props.clientId);
        query.value = option ? option.label : "";
      } else if (props.clientName) {
        query.value = props.clientName;
      } else {
        query.value = "";
      }
    },
    { immediate: true },
  );

  watch(
    () => filteredOptions.value.length,
    () => {
      highlightedIndex.value = 0;
    },
  );

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    query.value = target.value;
    isOpen.value = true;
    const trimmed = query.value.trim();
    if (!trimmed) {
      emit("update:clientId", "");
      emit("update:clientName", "");
    } else {
      const option = optionsList.value.find((opt) => opt.label.toLowerCase() === trimmed.toLowerCase());
      if (option) {
        emit("update:clientId", option.value);
        emit("update:clientName", "");
      } else {
        emit("update:clientId", "");
        emit("update:clientName", trimmed);
      }
    }
  };

  const onBlur = () => {
    setTimeout(() => {
      isOpen.value = false;
      if (props.clientId) {
        const option = optionsList.value.find((opt: SearchableOption) => opt.value === props.clientId);
        query.value = option ? option.label : "";
      } else if (props.clientName) {
        query.value = props.clientName;
      } else {
        query.value = "";
      }
    }, 150);
  };

  const selectOption = (opt: SearchableOption) => {
    if (opt.value === "") {
      emit("update:clientId", "");
      emit("update:clientName", "");
      query.value = "";
    } else {
      emit("update:clientId", opt.value);
      emit("update:clientName", "");
      query.value = opt.label;
    }
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

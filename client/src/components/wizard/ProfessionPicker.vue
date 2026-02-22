<template>
  <div class="relative">
    <div
      v-if="!selectedProfession"
      class="relative"
    >
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        autocomplete="off"
        :placeholder="$t('professionPicker.placeholder')"
        class="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-gray-900 transition-colors"
        @input="onInput"
        @focus="open = true"
        @keydown.enter.prevent="handleEnter"
        @keydown.escape="open = false"
        @keydown.arrow-down.prevent="moveHighlight(1)"
        @keydown.arrow-up.prevent="moveHighlight(-1)"
      />
      <button
        v-if="query"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="clearSelection"
      >
        ✕
      </button>
    </div>

    <div
      v-if="!selectedProfession && open && (filteredResults.length > 0 || showAiOption || isSearching)"
      class="absolute z-50 mt-1 w-full rounded-xl border border-gray-300 bg-white overflow-hidden"
      style="box-shadow: 0 8px 24px rgba(0,0,0,0.15);"
    >
      <ul class="max-h-60 overflow-y-auto py-1">
        <li
          v-if="isSearching"
          class="px-4 py-3 text-sm text-gray-500 flex items-center gap-2"
        >
          <span class="animate-spin inline-block">⟳</span>
          {{ $t('professionPicker.searching') }}
        </li>

        <template v-else>
          <li
            v-for="(prof, i) in filteredResults"
            :key="prof.id"
            :class="[
              'px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors',
              highlighted === i
                ? 'bg-brand-accent/10 text-brand-accent'
                : 'text-gray-800 hover:bg-gray-50',
            ]"
            @mousedown.prevent="selectProfession(prof)"
          >
            <span class="font-medium">{{ prof.label }}</span>
          </li>

          <li
            v-if="showAiOption"
            :class="[
              'px-4 py-3 cursor-pointer text-sm font-medium flex items-center gap-2 border-t-2 border-purple-100 transition-colors',
              highlighted === filteredResults.length
                ? 'bg-purple-100 text-purple-800'
                : 'bg-purple-50/60 text-purple-700 hover:bg-purple-100',
            ]"
            @mousedown.prevent="discoverWithAI"
          >
            <span>{{ $t('professionPicker.discoverWithAI', { name: query }) }}</span>
          </li>
        </template>
      </ul>
    </div>

    <div
      v-if="isLoading"
      class="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3 text-sm text-gray-500"
    >
      <span class="animate-spin text-base">⟳</span>
      <span>{{ $t('professionPicker.loading') }}</span>
    </div>

    <div
      v-if="aiError"
      class="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600"
    >
      {{ aiError }}
    </div>

    <div
      v-if="selectedProfession && !isLoading"
      class="rounded-xl border-2 border-green-400 bg-white overflow-hidden"
    >
      <div class="px-4 py-3 bg-green-50 flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-bold text-green-800 flex items-center gap-1.5">
            <span class="text-green-500 text-base">✓</span>
            {{ selectedProfession.label }}
            <span
              v-if="selectedSource === 'ai'"
              class="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
            >
              Nueva · creada con IA
            </span>
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
          @click="clearSelection"
        >
          {{ $t('professionPicker.change') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { professionApi, type Profession, type ProfessionCategory } from "@/infrastructure/professionApi";
  import { useConfirmDialog } from "@/composables/useConfirmDialog";

  const { t } = useI18n();
  const { show: showConfirm } = useConfirmDialog();

  type FullProfession = Profession & { categories: ProfessionCategory[] };

  const props = defineProps<{
    modelValue: string;
    hasUserServices?: boolean;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
  }>();

  const inputRef = ref<HTMLInputElement | null>(null);
  const query = ref("");
  const open = ref(false);
  const highlighted = ref(-1);
  const isSearching = ref(false);
  const isLoading = ref(false);
  const aiError = ref("");
  const selectedSource = ref<"existing" | "ai">("existing");

  const allResults = ref<Profession[]>([]);
  const selectedProfession = ref<FullProfession | null>(null);

  const filteredResults = computed(() => allResults.value);

  const showAiOption = computed(
    () =>
      query.value.trim().length >= 3 &&
      !isSearching.value &&
      filteredResults.value.length === 0,
  );

  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const onInput = () => {
    aiError.value = "";
    selectedProfession.value = null;
    open.value = true;
    highlighted.value = -1;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = query.value.trim();
      if (q.length < 1) {
        allResults.value = [];
        return;
      }
      isSearching.value = true;
      try {
        allResults.value = await professionApi.search(q);
      } finally {
        isSearching.value = false;
      }
    }, 300);
  };

  const loadAndSelect = async (id: string, label: string, source: "existing" | "ai") => {
    open.value = false;
    aiError.value = "";
    isLoading.value = true;
    try {
      const full = await professionApi.getById(id);
      if (full) {
        selectedProfession.value = full;
        selectedSource.value = source;
        query.value = full.label;
        emit("update:modelValue", full.id);
      } else {
        selectedProfession.value = { id, label, categories: [] };
        selectedSource.value = source;
        query.value = label;
        emit("update:modelValue", id);
      }
    } finally {
      isLoading.value = false;
    }
  };

  const selectProfession = (prof: Profession) => {
    loadAndSelect(prof.id, prof.label, "existing");
  };

  const clearSelection = async () => {
    if (selectedProfession.value) {
      const ok = await showConfirm({
        title: t("professionPicker.confirmChangeTitle"),
        message: t("professionPicker.confirmChangeMessage"),
        confirmLabel: t("professionPicker.confirmChangeBtn"),
        variant: "danger",
      });
      if (!ok) return;
    }
    selectedProfession.value = null;
    query.value = "";
    emit("update:modelValue", "");
    allResults.value = [];
    aiError.value = "";
    setTimeout(() => inputRef.value?.focus(), 50);
  };

  const discoverWithAI = async () => {
    const name = query.value.trim();
    if (!name) return;
    open.value = false;
    isLoading.value = true;
    aiError.value = "";
    selectedProfession.value = null;
    try {
      const result = await professionApi.discover(name);
      if (!result.valid && result.source === "ai") {
        aiError.value = result.reason ?? t("professionPicker.notValid");
        return;
      }
      if (result.profession) {
        selectedProfession.value = result.profession as FullProfession;
        selectedSource.value = "ai";
        query.value = result.profession.label;
        emit("update:modelValue", result.profession.id);
      }
    } catch (e) {
      aiError.value = e instanceof Error ? e.message : t("professionPicker.errorAI");
    } finally {
      isLoading.value = false;
    }
  };

  const moveHighlight = (dir: 1 | -1) => {
    const max = filteredResults.value.length + (showAiOption.value ? 0 : -1);
    highlighted.value = Math.max(-1, Math.min(max, highlighted.value + dir));
  };

  const handleEnter = () => {
    if (highlighted.value >= 0 && highlighted.value < filteredResults.value.length) {
      selectProfession(filteredResults.value[highlighted.value]);
    } else if (highlighted.value === filteredResults.value.length && showAiOption.value) {
      discoverWithAI();
    }
  };

  watch(
    () => props.modelValue,
    async (id) => {
      if (!id || selectedProfession.value?.id === id) return;
      isLoading.value = true;
      try {
        const full = await professionApi.getById(id);
        if (full) {
          selectedProfession.value = full;
          selectedSource.value = "existing";
          query.value = full.label;
        }
      } finally {
        isLoading.value = false;
      }
    },
    { immediate: true },
  );
</script>

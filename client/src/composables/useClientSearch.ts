import { ref, computed } from "vue";
import { clientsApi } from "@/infrastructure/clientsApi";
import type { ClientSearchResult, SpecialFilter } from "@/interfaces";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export const useClientSearch = () => {
  const query = ref("");
  const results = ref<ClientSearchResult[]>([]);
  const serviceHint = ref<string[]>([]);
  const specialFilter = ref<SpecialFilter>(null);
  const isSearching = ref(false);
  const hasSearched = ref(false);
  const error = ref<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const isQueryValid = computed(() => query.value.trim().length >= MIN_QUERY_LENGTH);

  const resetState = () => {
    results.value = [];
    serviceHint.value = [];
    specialFilter.value = null;
    hasSearched.value = false;
    error.value = null;
  };

  const search = async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      resetState();
      return;
    }

    isSearching.value = true;
    error.value = null;

    try {
      const response = await clientsApi.searchClients(trimmed);
      results.value = response.results;
      serviceHint.value = response.serviceHint;
      specialFilter.value = response.specialFilter;
      hasSearched.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error en la búsqueda";
      results.value = [];
      serviceHint.value = [];
      specialFilter.value = null;
    } finally {
      isSearching.value = false;
    }
  };

  const onQueryChange = (value: string) => {
    query.value = value;
    if (debounceTimer) clearTimeout(debounceTimer);

    if (value.trim().length < MIN_QUERY_LENGTH) {
      resetState();
      isSearching.value = false;
      return;
    }

    isSearching.value = true;
    debounceTimer = setTimeout(() => search(value), DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    query.value = "";
    resetState();
    isSearching.value = false;
  };

  return {
    query,
    results,
    serviceHint,
    specialFilter,
    isSearching,
    hasSearched,
    error,
    isQueryValid,
    onQueryChange,
    clearSearch,
  };
};

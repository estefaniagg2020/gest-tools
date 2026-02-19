import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { getBusinessTerminology } from "@/data/businessTerminology";

export const useBusinessTerminology = () => {
  const gestorConfigStore = useGestorConfigStore();
  const { businessType } = storeToRefs(gestorConfigStore);
  return computed(() => getBusinessTerminology(businessType.value));
};

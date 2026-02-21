import { ref, readonly } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { bookingApi } from "@/infrastructure/bookingApi";
import { businessConfigApi } from "@/infrastructure/businessConfigApi";

const defaultVatPercent = ref(21);
const cartEnabled = ref(false);
const bonosEnabled = ref(true);
const serviciosEnabled = ref(true);
const inventarioEnabled = ref(true);
const loaded = ref(false);

export const useBillingConfig = () => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  const load = async (): Promise<void> => {
    const businessId = user.value?.businessId ?? null;
    const id = businessId
      ? businessId
      : await bookingApi.getBusinesses().then((list) => {
          const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
          return first?.id ?? null;
        });
    if (!id) {
      loaded.value = true;
      return;
    }
    try {
      const config = await businessConfigApi.getConfig(id);
      if (config) {
        defaultVatPercent.value =
          typeof config.defaultVatPercent === "number" ? config.defaultVatPercent : 21;
        cartEnabled.value = config.cartEnabled ?? false;
        bonosEnabled.value = config.bonosEnabled ?? true;
        serviciosEnabled.value = config.serviciosEnabled ?? true;
        inventarioEnabled.value = config.inventarioEnabled ?? true;
      }
    } catch {
      // keep defaults
    }
    loaded.value = true;
  };

  const priceWithVat = (price: number, vatPercent?: number): number => {
    const vat = vatPercent ?? defaultVatPercent.value;
    return Math.round(price * (1 + vat / 100) * 100) / 100;
  };

  return {
    defaultVatPercent: readonly(defaultVatPercent),
    cartEnabled: readonly(cartEnabled),
    bonosEnabled: readonly(bonosEnabled),
    serviciosEnabled: readonly(serviciosEnabled),
    inventarioEnabled: readonly(inventarioEnabled),
    loaded: readonly(loaded),
    load,
    priceWithVat,
  };
};

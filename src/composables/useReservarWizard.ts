import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { bookingApi } from "@/infrastructure/bookingApi";
import type {
  Business,
  Service,
  Slot,
  WaitlistNotification,
} from "@/infrastructure/bookingApi";

export type ReservarStep =
  | "business"
  | "service"
  | "date"
  | "slot"
  | "summary"
  | "payment"
  | "done";

export const useReservarWizard = () => {
  const authStore = useAuthStore();

  const step = ref<ReservarStep>("business");
  const businesses = ref<Business[]>([]);
  const services = ref<Service[]>([]);
  const slots = ref<Slot[]>([]);
  const occupiedSlots = ref<Slot[]>([]);
  const waitlistNotifications = ref<WaitlistNotification[]>([]);
  const loading = ref(false);
  const error = ref("");

  const selectedBusinessId = ref<string | null>(null);
  const selectedService = ref<Service | null>(null);
  const selectedDate = ref("");
  const selectedSlot = ref<Slot | null>(null);
  const createdBooking = ref<unknown>(null);

  const fixedBusinessId = computed(() => authStore.user?.businessId ?? null);
  const selectedBusiness = computed(() =>
    businesses.value.find((b) => b.id === selectedBusinessId.value) ?? null,
  );

  const loadBusinesses = async () => {
    loading.value = true;
    error.value = "";
    try {
      businesses.value = await bookingApi.getBusinesses();
      if (fixedBusinessId.value) {
        selectedBusinessId.value = fixedBusinessId.value;
      } else if (businesses.value.length === 1) {
        selectedBusinessId.value = businesses.value[0]!.id;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al cargar";
    } finally {
      loading.value = false;
    }
  };

  const loadServices = async () => {
    const id = selectedBusinessId.value ?? fixedBusinessId.value;
    if (!id) return;
    loading.value = true;
    error.value = "";
    try {
      services.value = await bookingApi.getServices(id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al cargar";
    } finally {
      loading.value = false;
    }
  };

  const loadSlots = async (smart = true) => {
    const id = selectedBusinessId.value ?? fixedBusinessId.value;
    if (!id || !selectedService.value || !selectedDate.value) return;
    loading.value = true;
    error.value = "";
    try {
      slots.value = await bookingApi.getAvailability(
        id,
        selectedDate.value,
        selectedService.value.id,
        smart,
      );
      occupiedSlots.value = await bookingApi.getOccupiedSlots(
        id,
        selectedDate.value,
        selectedService.value.id,
      );
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al cargar";
    } finally {
      loading.value = false;
    }
  };

  const loadWaitlistNotifications = async () => {
    try {
      waitlistNotifications.value = await bookingApi.getMyNotifications();
    } catch {
      waitlistNotifications.value = [];
    }
  };

  const addToWaitlist = async (slot: Slot): Promise<boolean> => {
    const id = selectedBusinessId.value ?? fixedBusinessId.value;
    if (!id || !selectedService.value) return false;
    loading.value = true;
    error.value = "";
    try {
      await bookingApi.addToWaitlist({
        businessId: id,
        serviceId: selectedService.value.id,
        preferredStart: slot.start,
        preferredEnd: slot.end,
      });
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al apuntarse";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const submitBooking = async (): Promise<boolean> => {
    const id = selectedBusinessId.value ?? fixedBusinessId.value;
    if (!id || !selectedService.value || !selectedSlot.value) return false;
    loading.value = true;
    error.value = "";
    try {
      const result = await bookingApi.createBooking({
        businessId: id,
        serviceId: selectedService.value.id,
        start: selectedSlot.value.start,
        end: selectedSlot.value.end,
        discountPercent:
          selectedSlot.value.discountPercent != null &&
          selectedSlot.value.discountPercent > 0
            ? selectedSlot.value.discountPercent
            : undefined,
      });
      createdBooking.value = result;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al reservar";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const clearSlots = () => {
    slots.value = [];
    occupiedSlots.value = [];
    selectedSlot.value = null;
  };

  const reset = () => {
    step.value = "business";
    selectedBusinessId.value = null;
    selectedService.value = null;
    selectedDate.value = "";
    selectedSlot.value = null;
    createdBooking.value = null;
    error.value = "";
  };

  return {
    step,
    businesses,
    services,
    slots,
    occupiedSlots,
    waitlistNotifications,
    loading,
    error,
    selectedBusinessId,
    selectedService,
    selectedDate,
    selectedSlot,
    createdBooking,
    fixedBusinessId,
    selectedBusiness,
    loadBusinesses,
    loadServices,
    loadSlots,
    loadWaitlistNotifications,
    addToWaitlist,
    submitBooking,
    clearSlots,
    reset,
  };
};

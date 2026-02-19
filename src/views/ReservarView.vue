<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col">
    <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold text-gray-800">Reservar cita</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <button
            type="button"
            class="p-1.5 rounded-full hover:bg-gray-100 relative"
            aria-label="Avisos de huecos liberados"
            @click="showNotificationsDropdown = !showNotificationsDropdown"
          >
            <span class="text-lg">🔔</span>
            <span
              v-if="notificationsList.length > 0"
              class="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-bold bg-brand-accent text-white rounded-full"
            >
              {{ notificationsList.length }}
            </span>
          </button>
          <div
            v-if="showNotificationsDropdown"
            class="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 max-h-80 overflow-y-auto"
          >
            <p
              v-if="notificationsList.length === 0"
              class="px-3 py-2 text-sm text-gray-500"
            >
              No tienes avisos
            </p>
            <button
              v-for="n in notificationsList"
              :key="n.id"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
              :class="n.readAt ? 'text-gray-600' : 'text-gray-900 font-medium'"
              @click="openNotification(n)"
            >
              <span class="text-brand-accent">Hueco liberado:</span>
              {{ formatNotificationSlot(n) }}
            </button>
          </div>
        </div>
        <RouterLink
          to="/reservar/cambiar-clave"
          class="text-sm text-brand-accent hover:underline"
        >
          Cambiar contraseña
        </RouterLink>
        <button
          type="button"
          class="text-sm text-gray-600 hover:underline"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

    <main class="flex-1 p-4 max-w-lg mx-auto w-full">
      <template v-if="step === 'done'">
        <div class="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p class="text-lg font-medium text-gray-800 mb-2">Reserva confirmada</p>
          <p class="text-sm text-gray-600 mb-4">
            {{ selectedBusinessName }} – {{ selectedServiceName }} –
            {{ summarySlotLabel }}
          </p>
          <BaseButton
            @click="wizard.reset(); step = 'business'; wizard.loadBusinesses()"
          >
            Hacer otra reserva
          </BaseButton>
        </div>
      </template>

      <template v-else-if="step === 'payment'">
        <div class="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p class="text-gray-700">Procesando pago…</p>
        </div>
      </template>

      <template v-else>
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <p v-if="wizard.error" class="text-sm text-red-600 mb-4">
            {{ wizard.error }}
          </p>

          <template v-if="step === 'business' && !fixedBusinessIdValue">
            <h2 class="text-base font-bold text-gray-800 mb-4">Elige el negocio</h2>
            <ul class="space-y-2">
              <li
                v-for="b in businessesList"
                :key="b.id"
                class="border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50"
                :class="{ 'ring-2 ring-brand-accent': selectedBusinessIdValue === b.id }"
                @click="selectBusiness(b.id)"
              >
                {{ b.name }}
              </li>
            </ul>
            <BaseButton
              class="mt-4 w-full"
              :disabled="!selectedBusinessIdValue || loadingValue"
              @click="nextToServices"
            >
              Siguiente
            </BaseButton>
          </template>

          <template v-else-if="step === 'service'">
            <h2 class="text-base font-bold text-gray-800 mb-4">Elige el servicio</h2>
            <ul class="space-y-2">
              <li
                v-for="s in servicesList"
                :key="s.id"
                class="border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50"
                :class="{ 'ring-2 ring-brand-accent': selectedServiceValue?.id === s.id }"
                @click="selectService(s)"
              >
                {{ s.name }} – {{ s.duration }} min · {{ s.price }} €
              </li>
            </ul>
            <BaseButton
              class="mt-4 w-full"
              :disabled="!selectedServiceValue || loadingValue"
              @click="nextToDate"
            >
              Siguiente
            </BaseButton>
          </template>

          <template v-else-if="step === 'date'">
            <h2 class="text-base font-bold text-gray-800 mb-4">Elige la fecha</h2>
            <input
              v-model="wizard.selectedDate"
              type="date"
              :min="todayStr"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              @change="onDateChange"
            />
            <BaseButton
              class="mt-4 w-full"
              :disabled="!wizard.selectedDate || loadingValue"
              @click="nextToSlot"
            >
              Siguiente
            </BaseButton>
          </template>

          <template v-else-if="step === 'slot'">
            <h2 class="text-base font-bold text-gray-800 mb-4">Elige el horario</h2>
            <p class="text-xs text-gray-500 mb-2">
              Los horarios con descuento rellenan huecos que convienen al negocio.
            </p>
            <ul class="space-y-2 max-h-56 overflow-y-auto">
              <li
                v-for="(s, i) in slotsList"
                :key="i"
                class="border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between gap-2"
                :class="{ 'ring-2 ring-brand-accent': isSlotSelected(s) }"
                @click="selectSlot(s)"
              >
                <span>{{ formatSlotTime(s) }}</span>
                <span
                  v-if="slotDiscount(s)"
                  class="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded"
                >
                  -{{ slotDiscount(s) }}%
                </span>
                <span class="text-sm shrink-0">
                  {{ selectedServiceValue ? formatSlotPrice(s) : "" }}
                </span>
              </li>
            </ul>
            <div
              v-if="occupiedSlotsList.length > 0"
              class="mt-4 pt-4 border-t border-gray-200"
            >
              <h3 class="text-sm font-semibold text-gray-700 mb-2">
                ¿No hay hueco? Te avisamos si se libera
              </h3>
              <ul class="space-y-2 max-h-40 overflow-y-auto">
                <li
                  v-for="(s, i) in occupiedSlotsList"
                  :key="`occ-${i}`"
                  class="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2 bg-gray-50"
                >
                  <span class="text-gray-600">{{ formatSlotTime(s) }}</span>
                  <button
                    type="button"
                    class="text-sm text-brand-accent hover:underline disabled:opacity-50"
                    :disabled="waitlistPending.has(slotKey(s))"
                    @click="handleAvisame(s)"
                  >
                    {{ waitlistPending.has(slotKey(s)) ? "Apuntado" : "Avísame cuando se libere" }}
                  </button>
                </li>
              </ul>
            </div>
            <BaseButton
              class="mt-4 w-full"
              :disabled="slotStepDisabled"
              @click="step = 'summary'"
            >
              Siguiente
            </BaseButton>
          </template>

          <template v-else-if="step === 'summary'">
            <h2 class="text-base font-bold text-gray-800 mb-4">Resumen</h2>
            <dl class="space-y-2 text-sm text-gray-700 mb-4">
              <dt class="font-medium">Negocio</dt>
              <dd>{{ selectedBusinessName }}</dd>
              <dt class="font-medium">Servicio</dt>
              <dd>{{ selectedServiceName }} – {{ summaryPriceLabel }} €</dd>
              <dt class="font-medium">Fecha y hora</dt>
              <dd>{{ summarySlotLabel }}</dd>
            </dl>
            <BaseButton
              class="w-full"
              :disabled="loadingValue"
              @click="handlePay"
            >
              {{ loadingValue ? "Procesando…" : "Pagar (simulado)" }}
            </BaseButton>
          </template>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useReservarWizard } from "@/composables/useReservarWizard";
import BaseButton from "@/components/common/BaseButton.vue";
import { bookingApi } from "@/infrastructure/bookingApi";
import type { Slot, Business, WaitlistNotification } from "@/infrastructure/bookingApi";

const router = useRouter();
const authStore = useAuthStore();
const wizard = useReservarWizard();
const step = ref<"business" | "service" | "date" | "slot" | "summary" | "payment" | "done">(
  "business",
);
const showNotificationsDropdown = ref(false);
const waitlistPending = ref<Set<string>>(new Set());

const todayStr = computed(() => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
});

const businessesList = computed(() => {
  const b = wizard.businesses as { value?: Business[] };
  return b?.value ?? [];
});
const servicesList = computed(() => {
  const s = wizard.services as { value?: { id: string; name: string; duration: number; price: number }[] };
  return s?.value ?? [];
});
const slotsList = computed<Slot[]>(() => {
  const sl = wizard.slots as { value?: Slot[] };
  return sl?.value ?? [];
});
const occupiedSlotsList = computed<Slot[]>(() => {
  const oc = wizard.occupiedSlots as { value?: Slot[] };
  return oc?.value ?? [];
});
const notificationsList = computed<WaitlistNotification[]>(() => {
  const n = wizard.waitlistNotifications as { value?: WaitlistNotification[] };
  return n?.value ?? [];
});
const loadingValue = computed(() => (wizard.loading as { value: boolean }).value);
const fixedBusinessIdValue = computed(
  () => (wizard.fixedBusinessId as { value: string | null }).value ?? null,
);

const selectedBusinessIdValue = computed(
  () => (wizard.selectedBusinessId as { value: string | null }).value,
);
const selectedServiceValue = computed(() => {
  const r = wizard.selectedService as { value: { id: string; name: string; duration: number; price: number } | null };
  return r?.value ?? null;
});
const selectedSlotValue = computed(() => {
  const r = wizard.selectedSlot as { value: Slot | null };
  return r?.value ?? null;
});
const selectedBusinessName = computed(() => {
  const b = (wizard.selectedBusiness as { value?: { name: string } })?.value;
  return b?.name ?? "";
});
const selectedServiceName = computed(() => {
  const s = (wizard.selectedService as { value?: { name: string } })?.value;
  return s?.name ?? "";
});
const selectedServicePrice = computed(() => {
  const s = (wizard.selectedService as { value?: { price: number } })?.value;
  return s?.price ?? 0;
});
const summarySlotLabel = computed(() => {
  const slot = (wizard.selectedSlot as { value?: Slot })?.value;
  return slot ? formatSlotDate(slot) : "";
});

const summaryPriceLabel = computed(() => {
  const slot = (wizard.selectedSlot as { value?: Slot })?.value;
  const price = selectedServicePrice.value;
  const discount = slot?.discountPercent ?? 0;
  return discount > 0 ? priceWithDiscount(price, discount).toFixed(2) : price.toFixed(2);
});

const slotStepDisabled = computed(
  () => !selectedSlotValue.value || loadingValue.value,
);

const selectBusiness = (id: string) => {
  (wizard.selectedBusinessId as { value: string | null }).value = id;
};

const selectService = (s: { id: string; name: string; duration: number; price: number }) => {
  (wizard.selectedService as { value: unknown }).value = s;
};

const selectSlot = (s: Slot) => {
  (wizard.selectedSlot as { value: unknown }).value = s;
};

const nextToServices = async () => {
  await wizard.loadServices();
  step.value = "service";
};

const nextToDate = () => {
  step.value = "date";
};

const onDateChange = () => {
  wizard.clearSlots();
};

const nextToSlot = async () => {
  await wizard.loadSlots(true);
  step.value = "slot";
};

const slotDiscount = (s: Slot) => s.discountPercent ?? 0;
const formatPrice = (price: number) => price.toFixed(2);
const priceWithDiscount = (price: number, percent: number) =>
  price * (1 - percent / 100);
const formatSlotPrice = (s: Slot) => {
  const price = selectedServiceValue.value?.price ?? 0;
  const discount = slotDiscount(s);
  const final = discount > 0 ? priceWithDiscount(price, discount) : price;
  return `${formatPrice(final)} €`;
};
const slotKey = (s: Slot) => `${s.start}-${s.end}`;

const handleAvisame = async (s: Slot) => {
  const ok = await wizard.addToWaitlist(s);
  if (ok) waitlistPending.value.add(slotKey(s));
};

const formatNotificationSlot = (n: WaitlistNotification) => {
  const start = new Date(n.slotStart);
  return start.toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openNotification = async (n: WaitlistNotification) => {
  try {
    await bookingApi.markNotificationRead(n.id);
    wizard.loadWaitlistNotifications();
  } catch {
    // ignore
  }
  showNotificationsDropdown.value = false;
};

const isSlotSelected = (s: Slot) => {
  const slot = selectedSlotValue.value;
  return slot?.start === s.start && slot?.end === s.end;
};

const formatSlotTime = (s: Slot) => {
  const start = new Date(s.start);
  const end = new Date(s.end);
  return `${start.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const formatSlotDate = (s: Slot | null) => {
  if (!s) return "";
  const d = new Date(s.start);
  return d.toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handlePay = async () => {
  step.value = "payment";
  await new Promise((r) => setTimeout(r, 1500));
  const ok = await wizard.submitBooking();
  step.value = ok ? "done" : "summary";
};

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "login" });
};

onMounted(async () => {
  await wizard.loadBusinesses();
  wizard.loadWaitlistNotifications();
  const fixedId = fixedBusinessIdValue.value;
  const list = businessesList.value;
  if (fixedId) {
    (wizard.selectedBusinessId as { value: string | null }).value = fixedId;
    await wizard.loadServices();
    step.value = "service";
  } else if (list.length === 0) {
    step.value = "business";
  } else if (list.length === 1) {
    (wizard.selectedBusinessId as { value: string | null }).value = list[0]!.id;
    await wizard.loadServices();
    step.value = "service";
  } else {
    step.value = "business";
  }
});
</script>

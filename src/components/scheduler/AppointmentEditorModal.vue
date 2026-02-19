<template>
  <Modal
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <template #title>{{ modalTitle }}</template>
    <form
      class="space-y-4"
      @submit.prevent="save"
    >
      <div
        v-if="isCancelled"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
      >
        <span>✕</span>
        <span>Esta cita está cancelada</span>
      </div>

      <div
        v-else-if="editingId && isPastAppointment"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium"
      >
        <span>⏰</span>
        <span>Esta cita ya ha pasado</span>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Cliente (opcional)</label>
        <ClientNameInput
          v-model:client-id="form.clientId"
          v-model:client-name="form.clientName"
          :options="clientOptions"
          placeholder="Buscar cliente o escribir nombre..."
          empty-option-label="Seleccionar cliente"
          :disabled="isCancelled"
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Servicio (opcional)</label>
        <SearchableSelect
          v-model="form.serviceId"
          :options="serviceOptions"
          placeholder="Buscar servicio..."
          empty-option-label="Seleccionar servicio"
          :disabled="isCancelled"
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Empleado (opcional)</label>
        <SearchableSelect
          v-model="form.memberId"
          :options="memberOptions"
          placeholder="Buscar empleado..."
          empty-option-label="Seleccionar empleado"
          :disabled="isCancelled"
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Fecha (opcional)</label>
        <input
          v-model="form.dateStr"
          type="date"
          :disabled="isCancelled"
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-60"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Inicio (opcional)</label>
          <input
            v-model="form.startTime"
            type="time"
            :disabled="isCancelled"
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-60"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Fin (opcional)</label>
          <input
            v-model="form.endTime"
            type="time"
            :disabled="isCancelled"
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-60"
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.isAtHome"
            type="checkbox"
            :disabled="isCancelled"
            class="rounded border-gray-300"
          />
          <span class="text-sm font-bold text-gray-700">Cita en domicilio</span>
        </label>
        <div class="flex flex-col gap-0.5">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.isVIP"
              type="checkbox"
              :disabled="isCancelled"
              class="rounded border-gray-300"
            />
            <span class="text-sm font-bold text-gray-700">VIP / Especial</span>
          </label>
          <p class="text-xs text-gray-500 ml-6">
            {{ $t('scheduler.vipSpecialHint') }}
          </p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Notas (opcional)</label>
        <textarea
          v-model="form.notes"
          rows="2"
          :disabled="isCancelled"
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-60"
        />
      </div>

      <div
        v-if="cartEnabled && !isCancelled"
        class="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3"
      >
        <h3 class="text-sm font-bold text-gray-700">
          {{ $t('scheduler.cartTitle') }}
        </h3>
        <p class="text-xs text-gray-600">
          {{ $t('scheduler.cartDesc') }}
        </p>
        <ul
          v-if="form.cartItems.length > 0"
          class="space-y-2"
        >
          <li
            v-for="item in form.cartItems"
            :key="item.id"
            class="flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded-lg bg-white border border-gray-100"
          >
            <span class="font-medium text-gray-800">{{ item.name }}</span>
            <span class="text-gray-600 tabular-nums">{{ item.quantity }} × {{ item.unitPrice.toFixed(2) }}€</span>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 text-xs font-medium"
              @click="removeCartItem(item.id)"
            >
              {{ $t('common.remove') }}
            </button>
          </li>
        </ul>
        <div class="flex flex-wrap gap-2 items-end">
          <input
            v-model="newCartName"
            type="text"
            :placeholder="$t('scheduler.cartProductNamePlaceholder')"
            class="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
            @keydown.enter.prevent="addCartItem"
          />
          <input
            v-model.number="newCartQuantity"
            type="number"
            min="1"
            class="w-16 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
          <input
            v-model.number="newCartUnitPrice"
            type="number"
            min="0"
            step="0.01"
            :placeholder="$t('scheduler.cartPricePlaceholder')"
            class="w-20 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
          <BaseButton
            type="button"
            variant="outline"
            class="shrink-0"
            @click="addCartItem"
          >
            {{ $t('common.add') }}
          </BaseButton>
        </div>
        <p
          v-if="form.cartItems.length > 0"
          class="text-xs text-gray-500 pt-1"
        >
          {{ $t('scheduler.cartSubtotal') }}: {{ cartTotalBeforeVat.toFixed(2) }}€
        </p>
      </div>

      <div
        v-if="memberBlockConflict"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm"
      >
        <span>🚫</span>
        <span>{{ memberBlockConflict }}</span>
      </div>

      <div
        v-if="deadTimeWarning"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm"
      >
        <span>⚠️</span>
        <span>{{ deadTimeWarning }}</span>
      </div>

      <div
        v-if="isCancelled && form.cancellationReason"
        class="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
      >
        <p class="text-xs font-bold text-gray-500 mb-1">Motivo de cancelación</p>
        <p class="text-sm text-gray-700">{{ form.cancellationReason }}</p>
      </div>

      <div
        v-if="showCancelForm"
        class="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3"
      >
        <p class="text-sm font-semibold text-red-700">Cancelar cita</p>
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Motivo (opcional)</label>
          <textarea
            v-model="cancelReason"
            rows="2"
            placeholder="Ej: el cliente no se presentó, solicitud del cliente..."
            class="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <BaseButton
            variant="ghost"
            type="button"
            class="rounded-xl! py-2.5!"
            @click="showCancelForm = false"
          >
            Volver
          </BaseButton>
          <button
            type="button"
            class="btn-appointment-danger"
            @click="onConfirmCancel"
          >
            Confirmar cancelación
          </button>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="pt-5 border-t border-gray-100">
        <!-- Cita cancelada -->
        <template v-if="editingId && isCancelled">
          <div class="flex items-center justify-end gap-3">
            <BaseButton
              variant="danger"
              class="rounded-xl! py-2.5!"
              @click="onDeleteClick"
            >
              {{ $t('scheduler.deletePermanently') }}
            </BaseButton>
            <BaseButton
              variant="primary"
              class="rounded-xl! py-2.5!"
              @click="onRestoreClick"
            >
              Restaurar cita
            </BaseButton>
          </div>
        </template>

        <!-- Cita activa sin formulario de cancelación -->
        <template v-else-if="editingId && !showCancelForm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <BaseButton
                variant="danger"
                type="button"
                class="rounded-xl! py-2.5!"
                @click="onDeleteClick"
              >
                Eliminar
              </BaseButton>
              <BaseButton
                variant="ghost"
                type="button"
                class="rounded-xl! py-2.5!"
                @click="showCancelForm = true"
              >
                Cancelar cita
              </BaseButton>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="!isConfirmed"
                type="button"
                class="btn-appointment-success"
                @click="onConfirmAppointment"
              >
                Confirmar
              </button>
              <button
                v-if="isConfirmed && !isPaid"
                type="button"
                class="btn-appointment-success"
                :title="$t('scheduler.chargeServiceHint')"
                @click="onChargeClick"
              >
                Cobrar
              </button>
              <BaseButton
                type="submit"
                class="rounded-xl! py-2.5!"
              >
                {{ $t('common.save') }}
              </BaseButton>
            </div>
          </div>
        </template>

        <!-- Nueva cita o formulario de cancelación visible -->
        <template v-else-if="!isCancelled && !showCancelForm">
          <div class="flex justify-end">
            <BaseButton
              type="submit"
              class="rounded-xl! py-2.5!"
            >
              {{ $t('common.save') }}
            </BaseButton>
          </div>
        </template>
      </div>
    </form>
  </Modal>

  <Modal
    :is-open="showDuplicateConfirmModal"
    @close="showDuplicateConfirmModal = false"
  >
    <template #title>{{ t('scheduler.clientHasAppointmentThisWeekTitle') }}</template>
    <p class="text-gray-700 text-sm">
      {{ t('scheduler.clientHasAppointmentThisWeekConfirm') }}
    </p>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="showDuplicateConfirmModal = false"
      >
        {{ t('common.cancel') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="onConfirmDuplicateAndSave"
      >
        {{ t('scheduler.createAnyway') }}
      </BaseButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from "vue";
  import { storeToRefs } from "pinia";
  import { useI18n } from "vue-i18n";
  import Modal from "@/components/common/Modal.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import SearchableSelect from "@/components/common/SearchableSelect.vue";
  import ClientNameInput from "@/components/common/ClientNameInput.vue";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";
  import { useTeamStore } from "@/stores/team";
  import { useAppointmentStore } from "@/stores/appointment";
  import { useScheduleStore } from "@/stores/schedule";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
  import { useToast } from "@/composables/useToast";
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { useConfirmDialog } from "@/composables/useConfirmDialog";
  import type { Appointment, CartItem } from "@/interfaces";
  import { slotOverlapsExisting } from "@/composables/useScheduleOverlap";

  const props = defineProps<{
    isOpen: boolean;
    editAppointment: Appointment | null;
    initialDate?: Date;
    initialHour?: number;
    initialMemberId?: string;
    slotDurationMinutes?: number;
  }>();

  const emit = defineEmits<{
    (e: "close"): void;
    (e: "save"): void;
    (e: "delete"): void;
    (e: "cancel"): void;
  }>();

  const { t } = useI18n();
  const clientStore = useClientStore();
  const serviceStore = useServiceStore();
  const teamStore = useTeamStore();
  const appointmentStore = useAppointmentStore();
  const scheduleStore = useScheduleStore();
  const schedulerSettingsStore = useSchedulerSettingsStore();
  const { slotDurationMinutes: storeSlotDuration } = storeToRefs(schedulerSettingsStore);
  const { addToast } = useToast();
  const { defaultVatPercent, priceWithVat, cartEnabled } = useBillingConfig();
  const { show: showConfirm } = useConfirmDialog();

  const editingId = ref<string | null>(null);
  const error = ref("");
  const showCancelForm = ref(false);
  const cancelReason = ref("");
  const showDuplicateConfirmModal = ref(false);

  const form = reactive({
    clientId: "",
    clientName: "",
    serviceId: "",
    memberId: "",
    dateStr: "",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
    cancellationReason: "",
    isAtHome: false,
    isVIP: false,
    cartItems: [] as CartItem[],
  });

  const clientOptions = computed(() =>
    clientStore.clients.map((c) => ({ value: c.id, label: c.name })),
  );
  const serviceOptions = computed(() => {
    const vat = defaultVatPercent.value;
    return serviceStore.services.map((s) => {
      const total = vat > 0 ? priceWithVat(s.price) : s.price;
      const priceLabel = vat > 0 ? `${s.price}€ (${total.toFixed(2)}€ ${t("servicios.priceWithVatSuffix")})` : `${s.price}€`;
      return {
        value: s.id,
        label: `${s.name} (${s.duration} min · ${priceLabel})`,
      };
    });
  });
  const memberOptions = computed(() =>
    teamStore.members.map((m) => ({ value: m.id, label: m.name })),
  );

  const isCancelled = computed(() => {
    if (!editingId.value) return false;
    const apt = appointmentStore.getById(editingId.value);
    return apt?.status === "cancelled";
  });

  const isPaid = computed(() => {
    if (!editingId.value) return false;
    const apt = appointmentStore.getById(editingId.value);
    return (apt?.paymentStatus ?? "pending") === "paid";
  });

  const isConfirmed = computed(() => {
    if (!editingId.value) return false;
    const apt = appointmentStore.getById(editingId.value);
    return (apt?.status ?? "pending") === "confirmed";
  });

  const modalTitle = computed(() => {
    if (!editingId.value) return t("scheduler.newAppointment");
    if (isCancelled.value) return t("scheduler.cancelledAppointmentTitle");
    return t("scheduler.editAppointmentTitle");
  });

  const isPastAppointment = computed(() => {
    const apt = props.editAppointment;
    if (!apt) return false;
    return new Date(apt.end) < new Date();
  });

  const slotDuration = computed(
    () => props.slotDurationMinutes ?? storeSlotDuration.value ?? 60,
  );

  const appointmentDurationMinutes = computed(() => {
    const start = form.startTime || "09:00";
    const end = form.endTime || "10:00";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  });

  const deadTimeMinutes = computed(() => {
    const slot = slotDuration.value;
    const duration = appointmentDurationMinutes.value;
    if (duration >= slot) return 0;
    return slot - duration;
  });

  const deadTimeWarning = computed(() => {
    const dead = deadTimeMinutes.value;
    if (dead <= 0) return null;
    return `Tiempo muerto de ${dead} min. Considera mover la cita para optimizar el hueco.`;
  });

  const memberBlockConflict = computed(() => {
    const memberId = form.memberId?.trim();
    const dateStr = form.dateStr;
    const startTime = form.startTime;
    const endTime = form.endTime;
    if (!memberId || !dateStr || !startTime || !endTime) return null;
    const apptStart = new Date(`${dateStr}T${startTime}:00`).getTime();
    const apptEnd = new Date(`${dateStr}T${endTime}:00`).getTime();
    const conflict = scheduleStore.blocks.find((b) => {
      if (b.memberId !== memberId || b.status === "cancelled") return false;
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.end).getTime();
      return apptStart < bEnd && bStart < apptEnd;
    });
    if (!conflict) return null;
    const member = teamStore.members.find((m) => m.id === memberId);
    const memberName = member?.name ?? "El empleado";
    return `${memberName} tiene un bloque interno en ese horario ("${conflict.title}").`;
  });

  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const toISODateTime = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString();
  };

  watch(
    () => [props.isOpen, props.editAppointment, props.initialDate, props.initialHour, props.initialMemberId],
    () => {
      error.value = "";
      showCancelForm.value = false;
      cancelReason.value = "";
      if (props.editAppointment) {
        editingId.value = props.editAppointment.id;
        form.clientId = props.editAppointment.clientId ?? "";
        form.clientName = props.editAppointment.clientName ?? "";
        form.serviceId = props.editAppointment.serviceId ?? "";
        form.memberId = props.editAppointment.memberId ?? "";
        form.isAtHome = props.editAppointment.isAtHome ?? false;
        form.isVIP = props.editAppointment.isVIP ?? false;
        const start = new Date(props.editAppointment.start);
        form.dateStr = toDateStr(start);
        form.startTime = start.toTimeString().slice(0, 5);
        const end = new Date(props.editAppointment.end);
        form.endTime = end.toTimeString().slice(0, 5);
        form.notes = props.editAppointment.notes ?? "";
        form.cancellationReason = props.editAppointment.cancellationReason ?? "";
        form.cartItems = (props.editAppointment.cartItems ?? []).map((i) => ({ ...i }));
      } else {
        editingId.value = null;
        const d = props.initialDate ?? new Date();
        const h = props.initialHour ?? 9;
        form.clientId = "";
        form.clientName = "";
        form.serviceId = "";
        form.memberId = props.initialMemberId ?? teamStore.members[0]?.id ?? "";
        form.dateStr = toDateStr(d);
        form.startTime = `${String(h).padStart(2, "0")}:00`;
        form.endTime = `${String(h + 1).padStart(2, "0")}:00`;
        form.notes = "";
        form.cancellationReason = "";
        form.isAtHome = false;
        form.isVIP = false;
        form.cartItems = [];
      }
    },
    { immediate: true },
  );

  const newCartName = ref("");
  const newCartQuantity = ref(1);
  const newCartUnitPrice = ref(0);

  const addCartItem = () => {
    const name = newCartName.value.trim();
    if (!name) return;
    const qty = Math.max(1, Math.floor(newCartQuantity.value));
    const price = Math.max(0, Number(newCartUnitPrice.value));
    form.cartItems.push({
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      quantity: qty,
      unitPrice: price,
    });
    newCartName.value = "";
    newCartQuantity.value = 1;
    newCartUnitPrice.value = 0;
  };

  const removeCartItem = (id: string) => {
    form.cartItems = form.cartItems.filter((i) => i.id !== id);
  };

  const cartTotalBeforeVat = computed(() =>
    form.cartItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  const onChargeClick = async () => {
    const id = editingId.value;
    if (!id) return;
    const ok = await showConfirm({
      title: t("scheduler.chargeService"),
      message: t("scheduler.chargeAddNoteConfirm"),
      confirmLabel: t("scheduler.chargeService"),
      variant: "primary",
    });
    if (!ok) return;
    appointmentStore.update(id, { paymentStatus: "paid" });
    addToast(t("scheduler.chargeSimulationToast"), "charge");
  };

  const onConfirmAppointment = () => {
    const id = editingId.value;
    if (id) {
      appointmentStore.update(id, { status: "confirmed" });
    }
  };

  const onConfirmCancel = () => {
    const id = editingId.value;
    if (!id) return;
    appointmentStore.cancel(id, cancelReason.value.trim());
    showCancelForm.value = false;
    emit("cancel");
    emit("close");
  };

  const onRestoreClick = () => {
    const id = editingId.value;
    if (id) {
      appointmentStore.update(id, { status: "pending", cancellationReason: undefined });
    }
  };

  const onDeleteClick = () => {
    const id = editingId.value;
    if (id) {
      appointmentStore.remove(id);
      emit("delete");
    }
    emit("close");
  };

  const getWeekStart = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const sameWeek = (d1: Date, d2: Date) =>
    getWeekStart(d1).getTime() === getWeekStart(d2).getTime();

  const clientHasAppointmentThisWeek = (clientId: string, appointmentDate: Date) => {
    const clientAppointments = appointmentStore.getByClient(clientId);
    const active = clientAppointments.filter((a) => a.status !== "cancelled");
    return active.some((a) => sameWeek(new Date(a.start), appointmentDate));
  };

  const performSave = () => {
    const dateStr = form.dateStr || toDateStr(new Date());
    const startTime = form.startTime || "09:00";
    const endTime = form.endTime || "10:00";
    const start = toISODateTime(dateStr, startTime);
    const end = toISODateTime(dateStr, endTime);
    const clientId = form.clientId?.trim() || undefined;
    const clientName = !clientId && form.clientName?.trim() ? form.clientName.trim() : undefined;
    const serviceId = form.serviceId?.trim() || undefined;
    const memberId = form.memberId?.trim() || undefined;
    const cartItems = form.cartItems.length > 0 ? form.cartItems.map((i) => ({ ...i })) : undefined;
    if (editingId.value) {
      appointmentStore.update(editingId.value, {
        clientId,
        clientName,
        serviceId,
        memberId: memberId || undefined,
        start,
        end,
        notes: form.notes.trim() || undefined,
        isAtHome: form.isAtHome,
        isVIP: form.isVIP,
        cartItems,
      });
    } else {
      appointmentStore.add({
        clientId,
        clientName,
        serviceId,
        memberId: memberId || undefined,
        start,
        end,
        notes: form.notes.trim() || undefined,
        isAtHome: form.isAtHome,
        isVIP: form.isVIP,
        cartItems,
      });
    }
    emit("save");
  };

  const onConfirmDuplicateAndSave = () => {
    showDuplicateConfirmModal.value = false;
    performSave();
  };

  const save = async () => {
    if (isCancelled.value) return;
    const dateStr = form.dateStr || toDateStr(new Date());
    const startTime = form.startTime || "09:00";
    const endTime = form.endTime || "10:00";
    if (startTime >= endTime) {
      error.value = "La hora de fin debe ser posterior a la de inicio.";
      return;
    }
    const memberId = form.memberId?.trim() || "";
    if (memberId) {
      const activeBlocks = scheduleStore.blocks.filter((b) => b.status !== "cancelled");
      const activeAppointments = appointmentStore.appointments.filter((a) => a.status !== "cancelled");
      const date = new Date(dateStr + "T12:00:00");
      const occupied = slotOverlapsExisting({
        blocks: activeBlocks,
        appointments: activeAppointments,
        memberId,
        date,
        startTime,
        endTime,
        excludeAppointmentId: editingId.value ?? undefined,
      });
      if (occupied) {
        const proceed = await showConfirm({
          title: "Horario ocupado",
          message: t("scheduler.slotOccupiedConfirm"),
          confirmLabel: "Guardar de todos modos",
          variant: "primary",
        });
        if (!proceed) return;
      }
    }
    const clientId = form.clientId?.trim() || undefined;
    if (!editingId.value && clientId && clientHasAppointmentThisWeek(clientId, new Date(dateStr + "T12:00:00"))) {
      showDuplicateConfirmModal.value = true;
      return;
    }
    performSave();
  };
</script>

<style scoped>
  @reference "tailwindcss";

  .btn-appointment-success {
    @apply px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200;
    @apply bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98];
    @apply shadow-md shadow-emerald-500/20;
  }
  .btn-appointment-danger {
    @apply px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200;
    @apply bg-red-500 hover:bg-red-600 active:scale-[0.98];
    @apply shadow-md shadow-red-500/20;
  }
</style>

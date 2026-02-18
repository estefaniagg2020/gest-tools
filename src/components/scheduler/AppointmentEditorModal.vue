<template>
  <Modal
    :is-open="isOpen"
    :title="editingId ? (isCancelled ? 'Cita cancelada' : 'Editar cita') : 'Nueva cita'"
    @close="$emit('close')"
  >
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

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Cliente (opcional)</label>
        <SearchableSelect
          v-model="form.clientId"
          :options="clientOptions"
          placeholder="Buscar cliente..."
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
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700"
            @click="showCancelForm = false"
          >
            Volver
          </button>
          <button
            type="button"
            class="px-4 py-1.5 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600"
            @click="onConfirmCancel"
          >
            Confirmar cancelación
          </button>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="pt-4 flex flex-wrap justify-end gap-3 border-t border-gray-100">
        <template v-if="editingId && !isCancelled && !showCancelForm">
          <button
            type="button"
            class="mr-auto text-amber-600 hover:text-amber-700 font-medium text-sm"
            @click="showCancelForm = true"
          >
            Cancelar cita
          </button>
          <button
            type="button"
            class="text-red-400 hover:text-red-600 font-medium text-sm"
            @click="onDeleteClick"
          >
            Eliminar
          </button>
        </template>
        <template v-else-if="editingId && isCancelled">
          <button
            type="button"
            class="mr-auto text-red-400 hover:text-red-600 font-medium text-sm"
            @click="onDeleteClick"
          >
            Eliminar definitivamente
          </button>
        </template>
        <BaseButton
          variant="ghost"
          type="button"
          @click="$emit('close')"
        >
          Cerrar
        </BaseButton>
        <BaseButton
          v-if="!isCancelled"
          type="submit"
        >
          {{ editingId ? "Guardar" : "Crear cita" }}
        </BaseButton>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import Modal from "@/components/common/Modal.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import SearchableSelect from "@/components/common/SearchableSelect.vue";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";
  import { useTeamStore } from "@/stores/team";
  import { useAppointmentStore } from "@/stores/appointment";
  import { useScheduleStore } from "@/stores/schedule";
  import type { Appointment } from "@/interfaces";
  import { slotOverlapsExisting } from "@/composables/useScheduleOverlap";

  const props = defineProps<{
    isOpen: boolean;
    editAppointment: Appointment | null;
    initialDate?: Date;
    initialHour?: number;
    initialMemberId?: string;
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

  const editingId = ref<string | null>(null);
  const error = ref("");
  const showCancelForm = ref(false);
  const cancelReason = ref("");

  const form = reactive({
    clientId: "",
    serviceId: "",
    memberId: "",
    dateStr: "",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
    cancellationReason: "",
  });

  const clientOptions = computed(() =>
    clientStore.clients.map((c) => ({ value: c.id, label: c.name })),
  );
  const serviceOptions = computed(() =>
    serviceStore.services.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.duration} min · ${s.price}€)`,
    })),
  );
  const memberOptions = computed(() =>
    teamStore.members.map((m) => ({ value: m.id, label: m.name })),
  );

  const isCancelled = computed(() => {
    if (!editingId.value) return false;
    const apt = appointmentStore.getById(editingId.value);
    return apt?.status === "cancelled";
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
        form.serviceId = props.editAppointment.serviceId ?? "";
        form.memberId = props.editAppointment.memberId ?? "";
        const start = new Date(props.editAppointment.start);
        form.dateStr = toDateStr(start);
        form.startTime = start.toTimeString().slice(0, 5);
        const end = new Date(props.editAppointment.end);
        form.endTime = end.toTimeString().slice(0, 5);
        form.notes = props.editAppointment.notes ?? "";
        form.cancellationReason = props.editAppointment.cancellationReason ?? "";
      } else {
        editingId.value = null;
        const d = props.initialDate ?? new Date();
        const h = props.initialHour ?? 9;
        form.clientId = "";
        form.serviceId = "";
        form.memberId = props.initialMemberId ?? teamStore.members[0]?.id ?? "";
        form.dateStr = toDateStr(d);
        form.startTime = `${String(h).padStart(2, "0")}:00`;
        form.endTime = `${String(h + 1).padStart(2, "0")}:00`;
        form.notes = "";
        form.cancellationReason = "";
      }
    },
    { immediate: true },
  );

  const onConfirmCancel = () => {
    const id = editingId.value;
    if (!id) return;
    appointmentStore.cancel(id, cancelReason.value.trim());
    showCancelForm.value = false;
    emit("cancel");
    emit("close");
  };

  const onDeleteClick = () => {
    const id = editingId.value;
    if (id) {
      appointmentStore.remove(id);
      emit("delete");
    }
    emit("close");
  };

  const save = () => {
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
      if (occupied && !confirm(t("scheduler.slotOccupiedConfirm"))) return;
    }
    const start = toISODateTime(dateStr, startTime);
    const end = toISODateTime(dateStr, endTime);
    const clientId = form.clientId?.trim() || undefined;
    const serviceId = form.serviceId?.trim() || undefined;
    if (editingId.value) {
      appointmentStore.update(editingId.value, {
        clientId,
        serviceId,
        memberId: memberId || undefined,
        start,
        end,
        notes: form.notes.trim() || undefined,
      });
    } else {
      appointmentStore.add({
        clientId,
        serviceId,
        memberId: memberId || undefined,
        start,
        end,
        notes: form.notes.trim() || undefined,
      });
    }
    emit("save");
  };
</script>

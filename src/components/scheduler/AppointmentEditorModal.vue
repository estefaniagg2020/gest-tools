<template>
  <Modal
    :is-open="isOpen"
    title="Nueva cita"
    @close="$emit('close')"
  >
    <form
      class="space-y-4"
      @submit.prevent="save"
    >
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Cliente</label>
        <select
          v-model="form.clientId"
          required
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
        >
          <option value="">Seleccionar cliente</option>
          <option
            v-for="c in clientStore.clients"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </select>
        <p v-if="clientStore.clients.length === 0" class="text-xs text-amber-600 mt-1">
          Añade clientes en Clientes para poder crear citas.
        </p>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Servicio</label>
        <select
          v-model="form.serviceId"
          required
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
        >
          <option value="">Seleccionar servicio</option>
          <option
            v-for="s in serviceStore.services"
            :key="s.id"
            :value="s.id"
          >
            {{ s.name }} ({{ s.duration }} min · {{ s.price }}€)
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Empleado</label>
        <select
          v-model="form.therapistId"
          required
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
        >
          <option value="">Seleccionar empleado</option>
          <option
            v-for="t in therapistStore.therapists"
            :key="t.id"
            :value="t.id"
          >
            {{ t.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
        <input
          v-model="form.dateStr"
          type="date"
          required
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Inicio</label>
          <input
            v-model="form.startTime"
            type="time"
            required
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Fin</label>
          <input
            v-model="form.endTime"
            type="time"
            required
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Notas (opcional)</label>
        <textarea
          v-model="form.notes"
          rows="2"
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-teal/50"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
        <button
          v-if="editingId"
          type="button"
          class="mr-auto text-red-400 hover:text-red-600 font-medium text-sm"
          @click="$emit('delete')"
        >
          Eliminar
        </button>
        <BaseButton
          variant="ghost"
          type="button"
          @click="$emit('close')"
        >
          Cancelar
        </BaseButton>
        <BaseButton type="submit">{{ editingId ? "Guardar" : "Crear cita" }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from "vue";
  import Modal from "@/components/common/Modal.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";
  import { useTherapistStore } from "@/stores/therapist";
  import { useAppointmentStore } from "@/stores/appointment";
  import type { Appointment } from "@/interfaces";

  const props = defineProps<{
    isOpen: boolean;
    editAppointment: Appointment | null;
    initialDate?: Date;
    initialHour?: number;
    initialTherapistId?: string;
  }>();

  const emit = defineEmits<{
    (e: "close"): void;
    (e: "save"): void;
    (e: "delete"): void;
  }>();

  const clientStore = useClientStore();
  const serviceStore = useServiceStore();
  const therapistStore = useTherapistStore();
  const appointmentStore = useAppointmentStore();

  const editingId = ref<string | null>(null);
  const error = ref("");

  const form = reactive({
    clientId: "",
    serviceId: "",
    therapistId: "",
    dateStr: "",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
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
    () => [props.isOpen, props.editAppointment, props.initialDate, props.initialHour, props.initialTherapistId],
    () => {
      error.value = "";
      if (props.editAppointment) {
        editingId.value = props.editAppointment.id;
        form.clientId = props.editAppointment.clientId;
        form.serviceId = props.editAppointment.serviceId;
        form.therapistId = props.editAppointment.therapistId;
        const start = new Date(props.editAppointment.start);
        form.dateStr = toDateStr(start);
        form.startTime = start.toTimeString().slice(0, 5);
        const end = new Date(props.editAppointment.end);
        form.endTime = end.toTimeString().slice(0, 5);
        form.notes = props.editAppointment.notes ?? "";
      } else {
        editingId.value = null;
        const d = props.initialDate ?? new Date();
        const h = props.initialHour ?? 9;
        form.clientId = "";
        form.serviceId = "";
        form.therapistId = props.initialTherapistId ?? therapistStore.therapists[0]?.id ?? "";
        form.dateStr = toDateStr(d);
        form.startTime = `${String(h).padStart(2, "0")}:00`;
        form.endTime = `${String(h + 1).padStart(2, "0")}:00`;
        form.notes = "";
      }
    },
    { immediate: true },
  );

  const save = () => {
    if (form.startTime >= form.endTime) {
      error.value = "La hora de fin debe ser posterior a la de inicio.";
      return;
    }
    const start = toISODateTime(form.dateStr, form.startTime);
    const end = toISODateTime(form.dateStr, form.endTime);
    if (editingId.value) {
      appointmentStore.update(editingId.value, {
        clientId: form.clientId,
        serviceId: form.serviceId,
        therapistId: form.therapistId,
        start,
        end,
        notes: form.notes.trim() || undefined,
      });
    } else {
      appointmentStore.add({
        clientId: form.clientId,
        serviceId: form.serviceId,
        therapistId: form.therapistId,
        start,
        end,
        notes: form.notes.trim() || undefined,
      });
    }
    emit("save");
  };
</script>

<template>
  <div class="app-card overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between p-4 text-left hover:bg-app-bg/50 transition-colors"
      @click="isCollapsed = !isCollapsed"
    >
      <h4 class="font-semibold text-app-title text-sm flex items-center gap-2">
        <span>📋</span>
        {{ $t('scheduler.waitlist') }}
      </h4>
      <span class="text-app-text/60 text-xs">{{ isCollapsed ? '▶' : '▼' }}</span>
    </button>
    <div
      v-show="!isCollapsed"
      class="border-t border-app-border-subtle"
    >
      <div
        class="p-4 transition-colors min-h-[80px] flex flex-col gap-2"
        :class="[
          isDropTarget ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-400' : '',
        ]"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <p
          v-if="isDropTarget"
          class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
        >
          {{ $t('scheduler.waitlistFreeSlot', { count: waitlistCount }) }}
        </p>
        <p
          v-else
          class="text-xs text-app-text/70"
        >
          {{ $t('scheduler.waitlistHint') }}
        </p>
        <div
          v-if="isDraggingConfirmed"
          class="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs"
        >
          {{ $t('scheduler.dropHereToCancelAppointment') }}
        </div>
        <div
          v-else-if="waitlistCount > 0"
          class="space-y-1.5"
        >
          <div
            v-for="entry in waitlistEntries"
            :key="entry.id"
            class="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-app-surface"
          >
            <span class="truncate">{{ entry.serviceName }}</span>
            <span class="text-app-text/70 shrink-0">{{ entry.count }} {{ entry.count === 1 ? 'persona' : 'personas' }}</span>
          </div>
        </div>
        <p
          v-else-if="!showAddForm"
          class="text-xs text-app-text/50 italic"
        >
          No hay personas en lista de espera
        </p>

        <div
          v-if="canAdd"
          class="mt-2 space-y-2"
        >
          <button
            v-if="!showAddForm"
            type="button"
            class="w-full py-2 text-xs font-medium rounded-lg border border-dashed border-app-border hover:bg-app-bg transition-colors text-app-text"
            @click="openAddForm"
          >
            + {{ $t('scheduler.waitlistAddPerson') }}
          </button>
          <form
            v-else
            class="space-y-2 p-2 rounded-lg bg-app-bg/50 border border-app-border-subtle"
            @submit.prevent="submitAdd"
          >
            <label class="block text-[10px] font-medium text-app-text/80">{{ $t('scheduler.waitlistAddClient') }}</label>
            <select
              v-model="addForm.clientId"
              required
              class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
            >
              <option value="">
                {{ $t('scheduler.waitlistSelectClient') }}
              </option>
              <option
                v-for="c in clients"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
            <label class="block text-[10px] font-medium text-app-text/80">{{ $t('scheduler.waitlistAddService') }}</label>
            <select
              v-model="addForm.serviceId"
              required
              class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
            >
              <option value="">
                {{ $t('scheduler.waitlistSelectService') }}
              </option>
              <option
                v-for="s in services"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>
            <div class="grid grid-cols-2 gap-1.5">
              <div>
                <label class="block text-[10px] font-medium text-app-text/80">{{ $t('scheduler.waitlistPreferredDate') }}</label>
                <input
                  v-model="addForm.preferredDateStr"
                  type="date"
                  required
                  class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
                />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-app-text/80">{{ $t('scheduler.waitlistPreferredTime') }}</label>
                <input
                  v-model="addForm.preferredTimeStr"
                  type="time"
                  required
                  class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
                />
              </div>
            </div>
            <p
              v-if="addError"
              class="text-xs text-red-600"
            >
              {{ addError }}
            </p>
            <div class="flex gap-1.5">
              <button
                type="submit"
                class="flex-1 py-1.5 rounded bg-brand-primary text-white text-xs font-medium disabled:opacity-50"
                :disabled="addLoading"
              >
                {{ addLoading ? $t('common.loading') : $t('scheduler.waitlistAdd') }}
              </button>
              <button
                type="button"
                class="px-2 py-1.5 rounded border border-app-border text-xs"
                @click="cancelAdd"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { bookingApi } from "@/infrastructure/bookingApi";
  import type { Client } from "@/interfaces";
  import type { Service } from "@/interfaces/service";

  const { t } = useI18n();
  const props = withDefaults(
    defineProps<{
      isDraggingConfirmed?: boolean;
      waitlistEntries?: Array<{ id: string; serviceName: string; count: number }>;
      clients?: Client[];
      services?: Service[];
    }>(),
    { waitlistEntries: () => [], clients: () => [], services: () => [] },
  );

  const emit = defineEmits<{
    (e: "cancel-appointment", appointmentId: string): void;
    (e: "added"): void;
  }>();

  const isCollapsed = ref(false);
  const isDropTarget = ref(false);
  const showAddForm = ref(false);
  const addLoading = ref(false);
  const addError = ref("");
  const addForm = ref({
    clientId: "",
    serviceId: "",
    preferredDateStr: "",
    preferredTimeStr: "10:00",
  });

  const canAdd = computed(
    () => props.clients.length > 0 && props.services.length > 0,
  );

  const waitlistCount = computed(() =>
    props.waitlistEntries.reduce((sum, entry) => sum + entry.count, 0),
  );

  const openAddForm = () => {
    showAddForm.value = true;
    addError.value = "";
    const today = new Date();
    addForm.value = {
      clientId: "",
      serviceId: "",
      preferredDateStr: today.toISOString().slice(0, 10),
      preferredTimeStr: "10:00",
    };
  };

  const cancelAdd = () => {
    showAddForm.value = false;
    addError.value = "";
    addForm.value = { clientId: "", serviceId: "", preferredDateStr: "", preferredTimeStr: "10:00" };
  };

  const submitAdd = async () => {
    const service = props.services.find((s) => s.id === addForm.value.serviceId);
    if (!service) return;
    addError.value = "";
    addLoading.value = true;
    try {
      const [y, m, d] = addForm.value.preferredDateStr.split("-").map(Number);
      const [hh, mm] = addForm.value.preferredTimeStr.split(":").map(Number);
      const preferredStart = new Date(y, m - 1, d, hh, mm, 0);
      const preferredEnd = new Date(preferredStart.getTime() + service.duration * 60 * 1000);
      await bookingApi.addClientToWaitlist({
        clientId: addForm.value.clientId,
        serviceId: addForm.value.serviceId,
        preferredStart: preferredStart.toISOString(),
        preferredEnd: preferredEnd.toISOString(),
      });
      cancelAdd();
      emit("added");
    } catch (e) {
      addError.value = e instanceof Error ? e.message : t("scheduler.waitlistAddError");
    } finally {
      addLoading.value = false;
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (!props.isDraggingConfirmed) return;
    e.dataTransfer!.dropEffect = "move";
    isDropTarget.value = true;
  };

  const handleDragLeave = () => {
    isDropTarget.value = false;
  };

  const handleDrop = (e: DragEvent) => {
    isDropTarget.value = false;
    e.preventDefault();
    const raw = e.dataTransfer?.getData("application/json");
    if (!raw) return;
    try {
      const { id } = JSON.parse(raw) as { id: string };
      emit("cancel-appointment", id);
    } catch {
      /* ignore */
    }
  };
</script>

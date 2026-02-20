<template>
  <Modal
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <template #title>
      {{ editor.modalTitle }}
    </template>

    <form
      @submit.prevent="editor.save"
      class="space-y-4"
    >
      <div v-if="editor.members.value.length > 0">
        <label class="block text-sm font-bold text-gray-700 mb-1">Empleado</label>
        <SearchableSelect
          v-model="editor.form.memberId"
          :options="editor.memberOptions"
          placeholder="Buscar empleado..."
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">{{ editor.labels.LABEL_TITLE }}</label>
        <input
          v-model="editor.form.title"
          type="text"
          :placeholder="editor.labels.PLACEHOLDER_TITLE"
          required
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all font-medium"
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">{{ editor.labels.LABEL_DATE }}</label>
        <input
          :value="chosenDateStr"
          type="date"
          required
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          @input="onDateInput"
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">{{ editor.labels.LABEL_ACTIVITY_TYPE }}</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            v-for="type in editor.types"
            :key="type.value"
            @click="editor.form.type = type.value"
            class="px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all flex items-center justify-center gap-2"
            :class="
              editor.form.type === type.value
                ? type.activeClass
                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
            "
          >
            <span>{{ type.icon }}</span> {{ type.label }}
          </button>
        </div>
      </div>

      <div v-if="editor.form.type === 'work'">
        <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('scheduler.serviceOptionalLabel') }}</label>
        <SearchableSelect
          v-model="editor.form.serviceId"
          :options="editor.serviceOptions"
          :placeholder="$t('scheduler.searchService')"
          :empty-option-label="$t('scheduler.noneOption')"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ editor.labels.LABEL_START }}</label>
          <input
            v-model="editor.form.startTime"
            type="time"
            required
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ editor.labels.LABEL_END }}</label>
          <input
            v-model="editor.form.endTime"
            type="time"
            required
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">{{ editor.labels.LABEL_NOTES }}</label>
        <textarea
          v-model="editor.form.description"
          rows="2"
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
        ></textarea>
      </div>

      <div
        v-if="editor.error"
        class="text-red-500 text-sm bg-red-50 p-2 rounded-lg"
      >
        {{ editor.error }}
      </div>

      <div class="pt-4 flex items-center justify-between gap-3 border-t border-gray-100">
        <div v-if="editor.isEditing">
          <button
            type="button"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-red-400 text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
            @click="onDeleteBlockClick"
          >
            🗑 {{ editor.labels.BTN_DELETE }}
          </button>
        </div>
        <div v-else class="w-0" />
        <div class="flex gap-2">
          <BaseButton
            variant="ghost"
            type="button"
            @click="$emit('close')"
          >
            {{ editor.labels.BTN_CANCEL }}
          </BaseButton>
          <BaseButton type="submit">{{ editor.submitLabel }}</BaseButton>
        </div>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import Modal from "../common/Modal.vue";
  import BaseButton from "../common/BaseButton.vue";
  import SearchableSelect from "../common/SearchableSelect.vue";
  import type { ScheduleBlock } from "@/interfaces";
  import type { BlockEditorModalProps } from "@/interfaces/components";
  import { useBlockEditorForm } from "@/composables/useBlockEditorForm";
  import { useScheduleStore } from "@/stores/schedule";

  const props = defineProps<BlockEditorModalProps>();
  const scheduleStore = useScheduleStore();

  const emit = defineEmits<{
    (e: "close"): void;
    (e: "save", data: Partial<ScheduleBlock>): void;
    (e: "delete"): void;
    (e: "cancel"): void;
    (e: "update:date", value: Date): void;
  }>();

  const editor = useBlockEditorForm(props, emit);

  const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const chosenDateStr = ref("");

  watch(
    () => [props.isOpen, props.initialDate, props.editBlock] as const,
    ([open, initial, editBlock]) => {
      if (!open) return;
      if (editBlock?.start) {
        chosenDateStr.value = toYYYYMMDD(new Date(editBlock.start));
      } else if (initial) {
        chosenDateStr.value = toYYYYMMDD(initial);
      }
    },
    { immediate: true },
  );

  const onDateInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target?.value;
    if (value) {
      const next = new Date(value + "T12:00:00");
      if (!Number.isNaN(next.getTime())) {
        chosenDateStr.value = value;
        emit("update:date", next);
      }
    }
  };

  const onDeleteBlockClick = () => {
    const id = props.editBlock?.id;
    if (id) {
      scheduleStore.deleteBlock(id);
      emit("delete");
    }
    emit("close");
  };
</script>

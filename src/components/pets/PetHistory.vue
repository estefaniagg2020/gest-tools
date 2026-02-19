<template>
  <div class="h-full flex flex-col">
    <!-- Filters & Add Button -->
    <div class="flex items-center justify-between gap-4 mb-4">
      <div class="flex gap-2 items-center overflow-x-auto pb-1">
        <button
          v-for="type in noteTypes"
          :key="type.value"
          @click="selectedType = type.value"
          class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
          :class="selectedType === type.value ? 'bg-brand-accent text-white' : 'bg-app-bg text-app-text/70 hover:bg-app-bg/80'"
        >
          {{ type.label }}
        </button>
      </div>
      <BaseButton variant="primary" size="sm" @click="isAddNoteOpen = true">
         + {{ $t('common.add') }}
      </BaseButton>
    </div>

    <!-- Timeline -->
    <div v-if="filteredNotes.length > 0" class="flex-1 overflow-y-auto pr-2 space-y-4">
      <div v-for="note in filteredNotes" :key="note.id" class="relative pl-6 border-l-2 border-app-border-subtle hover:border-brand-accent/30 transition-colors">
         <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-app-bg border-2 border-brand-accent/50"></div>
         <div class="mb-1 flex justify-between items-start">
             <span class="text-xs font-semibold text-brand-accent uppercase tracking-wider">{{ note.type.replace('_', ' ') }}</span>
             <span class="text-xs text-app-text/50">{{ new Date(note.createdAt).toLocaleDateString() }} {{ new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
         </div>
         <div class="p-3 rounded-lg bg-app-surface border border-app-border shadow-sm text-sm text-app-title whitespace-pre-wrap">
             {{ note.content }}
         </div>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center text-app-text/50 text-sm italic">
        {{ $t('pets.noNotes') }}
    </div>

    <!-- Add Note Modal -->
    <Modal :is-open="isAddNoteOpen" :title="$t('pets.addNote')" @close="isAddNoteOpen = false">
        <form @submit.prevent="saveNote" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-app-title mb-1">Type</label>
                <select v-model="newNote.type" class="input-modern w-full rounded-xl border border-app-border px-3 py-2">
                    <option v-for="t in noteTypes.filter(x => x.value !== 'ALL')" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
            </div>
             <div>
                <label class="block text-sm font-medium text-app-title mb-1">Content</label>
                <textarea v-model="newNote.content" required rows="4" class="input-modern w-full rounded-xl border border-app-border px-3 py-2" placeholder="Write details here..."></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
                <BaseButton variant="secondary" type="button" @click="isAddNoteOpen = false">Cancel</BaseButton>
                <BaseButton variant="primary" type="submit">Save</BaseButton>
            </div>
        </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import Modal from "@/components/common/Modal.vue";

const props = defineProps<{
  petId: string;
}>();

const notes = ref<any[]>([]);
const isAddNoteOpen = ref(false);
const selectedType = ref('ALL');
const newNote = ref({ type: 'GENERAL', content: '' });

const noteTypes = [
    { value: 'ALL', label: 'All' },
    { value: 'GENERAL', label: 'General' },
    { value: 'VETERINARY_HISTORY', label: 'Vet History' },
    { value: 'TREATMENT', label: 'Treatment' },
    { value: 'FORMULA', label: 'Formula' },
    { value: 'ALLERGY', label: 'Allergy' },
];

async function fetchNotes() {
    if (!props.petId) return;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/${props.petId}/notes`);
        if (res.ok) notes.value = await res.json();
    } catch (e) { console.error(e); }
}

async function saveNote() {
    if (!props.petId) return;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/${props.petId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNote.value)
        });
        if (res.ok) {
            await fetchNotes();
            isAddNoteOpen.value = false;
            newNote.value.content = '';
        }
    } catch (e) { console.error(e); }
}

const filteredNotes = computed(() => {
    if (selectedType.value === 'ALL') return notes.value;
    return notes.value.filter(n => n.type === selectedType.value);
});

watch(() => props.petId, fetchNotes, { immediate: true });
</script>

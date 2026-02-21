<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <div class="mb-4">
        <RouterLink :to="{ name: 'clients' }" class="text-sm text-app-text/70 hover:text-brand-accent flex items-center gap-1">
            ← {{ $t('clients.backToClients') }}
        </RouterLink>
    </div>
    
    <template v-if="client">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-app-title">{{ client.name }}</h1>
          <div class="flex gap-4 mt-1 text-sm text-app-text/70">
              <span v-if="client.email">{{ client.email }}</span>
              <span v-if="client.phone">{{ client.phone }}</span>
          </div>
          <p v-if="client.notes" class="text-app-text/70 text-sm mt-2 italic">“{{ client.notes }}”</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <BaseButton variant="outline" @click="editClient(client)">
            {{ $t('common.edit') }}
          </BaseButton>
          <BaseButton variant="danger" @click="handleDelete">
            {{ $t('common.delete') }}
          </BaseButton>
        </div>
      </div>

      <!-- TABS -->
      <div class="border-b border-app-border mb-6">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                currentTab === tab.id
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent text-app-text/60 hover:text-app-text/80 hover:border-app-border',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
      </div>

      <!-- TAB CONTENT -->
      
      <!-- BONOS TAB -->
      <section v-if="currentTab === 'bonos'">
        <div class="flex items-center justify-between gap-4 mb-4">
          <h2 class="text-lg font-semibold text-app-title">{{ $t('clientBonos.sectionTitle') }}</h2>
          <BaseButton
            variant="outline"
            :disabled="bonoStore.templates.length === 0"
            @click="openAssignBono"
            class="text-sm"
          >
            {{ $t('clientBonos.assignBono') }}
          </BaseButton>
        </div>
        <ul v-if="clientBonosWithTemplate.length > 0" class="space-y-3">
            <li v-for="item in clientBonosWithTemplate" :key="item.bono.id" class="p-4 rounded-xl border border-app-border bg-app-surface shadow-sm flex flex-wrap justify-between items-center gap-4">
                 <div>
                    <p class="font-medium text-app-title">{{ item.template?.name }}</p>
                    <p class="text-sm text-app-text/60">
                        <template v-if="item.template?.type === 'pack'">Remaining: {{ item.bono.remainingSessions }}</template>
                        <template v-else>Paid: {{ item.bono.paidCount }} · Free: {{ item.bono.freeSessionsRemaining }}</template>
                    </p>
                 </div>
                 <div class="flex gap-2">
                      <template v-if="item.template?.type === 'pack'">
                        <BaseButton v-if="(item.bono.remainingSessions ?? 0) > 0" variant="outline" size="sm" @click="usePackSession(item.bono.id)">Use</BaseButton>
                      </template>
                      <template v-else>
                         <BaseButton variant="outline" size="sm" @click="recordLoyaltyPaid(item.bono.id)">Pay</BaseButton>
                         <BaseButton v-if="(item.bono.freeSessionsRemaining ?? 0) > 0" variant="outline" size="sm" @click="useLoyaltyFree(item.bono.id)">Use Free</BaseButton>
                      </template>
                       <BaseButton variant="secondary" size="sm" class="text-red-600" @click="removeClientBono(item.bono.id)">Remove</BaseButton>
                 </div>
            </li>
        </ul>
        <p v-else class="text-sm text-app-text/60 py-4">{{ $t('clientBonos.noBonosAssigned') }}</p>
      </section>

      <!-- HISTORY TAB -->
      <section v-if="currentTab === 'history'">
        <h2 class="text-lg font-semibold text-app-title mb-4">Appointment History</h2>
        <ul v-if="historyEntries.length > 0" class="space-y-3">
           <li v-for="entry in historyEntries" :key="entry.appointment.id" class="p-4 rounded-xl border border-app-border bg-app-surface shadow-sm grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <span class="font-medium">{{ formatHistoryDate(entry.appointment.start) }}</span>
                <span>{{ entry.serviceName }}</span>
                 <span class="text-app-text/60">{{ entry.appointment.notes || '-' }}</span>
                 <span :class="entry.appointment.status === 'cancelled' ? 'text-red-500' : 'text-green-600'">{{ entry.appointment.status }}</span>
           </li>
        </ul>
        <p v-else class="text-sm text-app-text/60 py-4">No history available.</p>
      </section>

    </template>
    
    <!-- MODALS -->
    
    <!-- EDIT CLIENT MODAL -->
    <Modal :is-open="isModalOpen" :title="isEditing ? 'Edit Client' : 'New Client'" @close="closeModal">
      <form class="space-y-4" @submit.prevent="saveClient">
         <div>
          <label class="block text-sm font-medium text-app-title mb-1">Name</label>
          <input v-model="form.name" type="text" required class="input-modern w-full rounded-xl border border-app-border px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">Email</label>
          <input v-model="form.email" type="email" class="input-modern w-full rounded-xl border border-app-border px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">Phone</label>
          <input v-model="form.phone" type="tel" class="input-modern w-full rounded-xl border border-app-border px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">Notes</label>
          <textarea v-model="form.notes" rows="2" class="input-modern w-full rounded-xl border border-app-border px-3 py-2" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="secondary" type="button" @click="closeModal">Cancel</BaseButton>
          <BaseButton variant="primary" type="submit">Save</BaseButton>
        </div>
      </form>
    </Modal>

     <!-- ASSIGN BONO MODAL -->
     <Modal :is-open="isAssignBonoOpen" :title="$t('clientBonos.assignBono')" @close="closeAssignBono">
        <form class="space-y-4" @submit.prevent="assignBono">
            <div>
                 <label class="block text-sm font-medium text-app-title mb-1">Bono / Pack</label>
                  <select v-model="selectedTemplateId" required class="input-modern w-full rounded-xl border border-app-border px-3 py-2">
                       <option value="" disabled>Select...</option>
                       <option v-for="t in bonoStore.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
                  </select>
            </div>
             <div class="flex justify-end gap-3 pt-4">
                <BaseButton variant="secondary" type="button" @click="closeAssignBono">Cancel</BaseButton>
                <BaseButton variant="primary" type="submit">Assign</BaseButton>
             </div>
        </form>
     </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseButton from "@/components/common/BaseButton.vue";
import Modal from "@/components/common/Modal.vue";
import { useClientStore } from "@/stores/client";
import { useBonoStore } from "@/stores/bono"; // Assuming store exists
import { useClientHistory } from "@/composables/useClientHistory";
import { useClientsManager } from "@/composables/useClientsManager";
import { useToast } from "@/composables/useToast";

const router = useRouter(); 
useI18n();
const clientStore = useClientStore();
const bonoStore = useBonoStore();
const { addToast } = useToast();

const { client, historyEntries, formatHistoryDate } = useClientHistory();
const { isModalOpen, isEditing, form, editClient, closeModal, saveClient } = useClientsManager();

// TABS
const tabs = [
    { id: 'bonos', name: 'Bonos & Packs' },
    { id: 'history', name: 'Historial' },
];
const currentTab = ref('bonos');

// BONOS LOGIC (Kept similar to existing)
const isAssignBonoOpen = ref(false);
const selectedTemplateId = ref("");

const clientBonosWithTemplate = computed(() => {
    if (!client.value) return [];
    return bonoStore.getBonosByClientId(client.value.id).map((b: any) => ({
      bono: b,
      template: bonoStore.getBonoById(b.bonoId),
    }));
});

const openAssignBono = () => { isAssignBonoOpen.value = true; };
const closeAssignBono = () => { isAssignBonoOpen.value = false; };
const assignBono = async () => {
    if (!client.value || !selectedTemplateId.value) return;
    try {
      await bonoStore.assignBonoToClient(client.value.id, selectedTemplateId.value);
      addToast("Bono assigned", "success");
      closeAssignBono();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al asignar bono";
      addToast(msg, "error");
    }
};
// ... other bono methods (omitted for brevity, assume similar logic or import from store)
const usePackSession = (id: string) => { bonoStore.usePackSession(id); };
const recordLoyaltyPaid = (id: string) => { bonoStore.recordLoyaltyPaidUse(id); };
const useLoyaltyFree = (id: string) => { bonoStore.useLoyaltyFreeSession(id); };
const removeClientBono = (id: string) => { if(confirm('Remove?')) bonoStore.removeClientBono(id); };


const handleDelete = async () => {
     if(client.value && confirm("Delete client?")) {
        await clientStore.deleteClient(client.value.id);
        router.push({ name: 'clients' });
     }
}

onMounted(() => {
    // clientStore.initialize(); 
    // bonoStore.initialize();
});

</script>

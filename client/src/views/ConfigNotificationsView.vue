<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <ConfigPageHeader
        :title="$t('configNotificaciones.title')"
        :description="$t('configNotificaciones.description')"
        :back-to="{ name: 'config' }"
        :back-label="$t('common.backToConfig')"
      />

      <div class="mt-8 space-y-8">
        <section class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">📱</span>
            Recordatorios por WhatsApp
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            Avisa a tus clientes por WhatsApp cuando tengan una cita: confirmación al reservar y recordatorio antes de la cita. Reduce los no-shows.
          </p>
          <div v-if="whatsappConfigLoading" class="mt-4 text-sm text-app-text/60">
            Cargando…
          </div>
          <div v-else-if="whatsappBusinessId" class="mt-4 space-y-4">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                v-model="whatsappRemindersEnabled"
                type="checkbox"
                class="h-4 w-4 rounded border-app-border-subtle text-brand-accent focus:ring-brand-accent"
              />
              <span class="text-sm font-medium text-app-title">Enviar recordatorios por WhatsApp</span>
            </label>
            <div v-if="whatsappRemindersEnabled">
              <label class="block text-sm font-medium text-app-title mb-1">Phone Number ID (WhatsApp Business API)</label>
              <input
                v-model="whatsappPhoneNumberId"
                type="text"
                placeholder="Ej: 123456789012345"
                class="w-full max-w-md p-2.5 bg-app-surface border border-app-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              />
              <p class="mt-1 text-xs text-app-text/60">
                Obtén este ID en
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-brand-accent underline"
                >Meta for Developers</a>.
                Configura también <code class="text-xs bg-app-surface px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> en el servidor.
              </p>
            </div>
            <p v-if="whatsappSaveError" class="text-sm text-amber-600">{{ whatsappSaveError }}</p>
            <p v-if="whatsappSaveSuccess" class="text-sm text-green-600">Guardado.</p>
            <button
              type="button"
              :disabled="whatsappSaving"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-brand-accent text-white hover:bg-brand-accent/90 disabled:opacity-50"
              @click="saveWhatsAppConfig"
            >
              {{ whatsappSaving ? "Guardando…" : "Guardar" }}
            </button>
          </div>
          <p v-else class="mt-3 text-sm text-app-text/60">
            Inicia sesión como gestor con un negocio asignado para configurar WhatsApp.
          </p>
        </section>

        <section class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">🎂</span>
            Cumpleaños del equipo
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            Añade la fecha de nacimiento en el perfil de cada empleado (Equipo) para ver los avisos aquí.
          </p>
          <div v-if="cumpleaniosEstaSemana.length > 0" class="mt-4">
            <p class="text-xs font-medium text-app-text/60 uppercase tracking-wider">Esta semana</p>
            <ul class="mt-2 space-y-2">
              <li
                v-for="c in cumpleaniosEstaSemana"
                :key="`${c.name}-${c.birthDate}`"
                class="flex items-center justify-between gap-2 text-sm"
              >
                <span class="text-app-title">{{ c.name }}</span>
                <span class="text-app-text/70 shrink-0">{{ c.label }}</span>
              </li>
            </ul>
          </div>
          <div v-if="cumpleaniosRestoDelMes.length > 0" class="mt-4">
            <p class="text-xs font-medium text-app-text/60 uppercase tracking-wider">Resto del mes</p>
            <ul class="mt-2 space-y-2">
              <li
                v-for="c in cumpleaniosRestoDelMes"
                :key="`${c.name}-${c.birthDate}`"
                class="flex items-center justify-between gap-2 text-sm"
              >
                <span class="text-app-title">{{ c.name }}</span>
                <span class="text-app-text/70 shrink-0">{{ c.label }}</span>
              </li>
            </ul>
          </div>
          <p
            v-if="cumpleaniosEstaSemana.length === 0 && cumpleaniosRestoDelMes.length === 0"
            class="mt-3 text-sm text-app-text/60"
          >
            No hay cumpleaños configurados en los próximos días.
          </p>
        </section>

        <section v-if="inventarioEnabled" class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">📦</span>
            Productos próximos a acabar
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            Productos con stock por debajo del mínimo.
          </p>
          <p v-if="loading" class="mt-3 text-sm text-app-text/60">Cargando…</p>
          <p v-else-if="error" class="mt-3 text-sm text-amber-600">
            No se han podido cargar los datos.
          </p>
          <ul v-else-if="productosBajoStock.length > 0" class="mt-4 space-y-2">
            <li
              v-for="p in productosBajoStock"
              :key="p.id"
              class="flex items-center justify-between gap-2 text-sm"
            >
              <span class="text-app-title truncate min-w-0" :title="p.name">{{ p.name }}</span>
              <span
                class="shrink-0 font-medium tabular-nums"
                :class="p.stock <= 0 ? 'text-red-500' : 'text-amber-500'"
              >
                {{ p.stock }} / {{ p.minStock }}
              </span>
            </li>
          </ul>
          <p
            v-else
            class="mt-3 text-sm text-app-text/60"
          >
            Todo en orden.
          </p>
        </section>

        <section class="rounded-xl border border-app-border-subtle bg-app-surface p-5">
          <h2 class="text-base font-semibold text-app-title flex items-center gap-2">
            <span aria-hidden="true">🏖️</span>
            Vacaciones del equipo
          </h2>
          <p class="mt-1 text-sm text-app-text/70">
            Próximas vacaciones programadas en la agenda (próximos 14 días).
          </p>
          <ul v-if="vacacionesProximas.length > 0" class="mt-4 space-y-3">
            <li
              v-for="(v, i) in vacacionesProximas"
              :key="`${v.memberName}-${v.start}-${i}`"
              class="text-sm"
            >
              <span class="font-medium text-app-title">{{ v.memberName }}</span>
              <span class="text-app-text/70"> — {{ v.title }}</span>
              <p class="mt-0.5 text-xs text-app-text/60">
                {{ formatVacationDates(v.start, v.end) }}
              </p>
            </li>
          </ul>
          <p
            v-else
            class="mt-3 text-sm text-app-text/60"
          >
            No hay vacaciones programadas en los próximos días.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useAuthStore } from "@/stores/auth";
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { useNotificacionesAvisos } from "@/composables/useNotificacionesAvisos";
  import { businessConfigApi } from "@/infrastructure/businessConfigApi";
  import ConfigPageHeader from "@/components/config/ConfigPageHeader.vue";

  const authStore = useAuthStore();
  const { inventarioEnabled } = useBillingConfig();
  const whatsappBusinessId = ref<string | null>(null);
  const whatsappConfigLoading = ref(true);
  const whatsappRemindersEnabled = ref(false);
  const whatsappPhoneNumberId = ref("");
  const whatsappSaving = ref(false);
  const whatsappSaveError = ref("");
  const whatsappSaveSuccess = ref(false);

  onMounted(async () => {
    whatsappBusinessId.value = authStore.user?.businessId ?? null;
    if (!whatsappBusinessId.value) {
      whatsappConfigLoading.value = false;
      return;
    }
    if (whatsappBusinessId.value) {
      try {
        const config = await businessConfigApi.getConfig(whatsappBusinessId.value);
        if (config) {
          whatsappRemindersEnabled.value = config.whatsappRemindersEnabled ?? false;
          whatsappPhoneNumberId.value = config.whatsappPhoneNumberId ?? "";
        }
      } catch {
        // ignore
      }
    }
    whatsappConfigLoading.value = false;
  });

  const saveWhatsAppConfig = async () => {
    if (!whatsappBusinessId.value) return;
    whatsappSaveError.value = "";
    whatsappSaveSuccess.value = false;
    whatsappSaving.value = true;
    try {
      await businessConfigApi.updateConfig(whatsappBusinessId.value, {
        whatsappRemindersEnabled: whatsappRemindersEnabled.value,
        whatsappPhoneNumberId: whatsappRemindersEnabled.value
          ? whatsappPhoneNumberId.value.trim() || null
          : null,
      });
      whatsappSaveSuccess.value = true;
    } catch (e) {
      whatsappSaveError.value = e instanceof Error ? e.message : "Error al guardar";
    } finally {
      whatsappSaving.value = false;
    }
  };

  const {
    vacacionesProximas,
    productosBajoStock,
    cumpleaniosEstaSemana,
    cumpleaniosRestoDelMes,
    loading,
    error,
  } = useNotificacionesAvisos();

  const formatVacationDates = (start: string, end: string): string => {
    const startDate = start.slice(0, 10);
    const endDate = end.slice(0, 10);
    const s = new Date(startDate + "T12:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
    const e = new Date(endDate + "T12:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
    return s === e ? s : `${s} – ${e}`;
  };
</script>

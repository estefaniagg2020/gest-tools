<template>
  <div class="servicios-gestor min-h-full overflow-y-auto">
    <div class="relative px-6 pt-8 pb-10">
      <div
        class="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-violet-50/30 pointer-events-none"
        aria-hidden="true"
      />
      <div class="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1">
            Catálogo
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Gestión de servicios
          </h1>
          <p class="mt-2 text-slate-500 max-w-xl">
            Tipo de servicio, nombre, precios y empleados por servicio.
          </p>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <BaseButton
            variant="outline"
            class="rounded-xl px-5 py-2.5 border-slate-200 text-slate-700 hover:bg-slate-50"
            @click="openCategoryModal"
          >
            Categorías
          </BaseButton>
          <BaseButton
            variant="accent"
            class="rounded-xl px-5 py-2.5"
            @click="openCreateModal"
          >
            <template #icon>
              <span class="text-lg leading-none">+</span>
            </template>
            Añadir servicio
          </BaseButton>
        </div>
      </div>

      <div class="relative space-y-8">
        <section
          v-for="(category, catIndex) in categories"
          :key="category.id"
          class="bg-white/90 backdrop-blur rounded-2xl shadow-sm shadow-slate-200/60 border border-slate-100/80 overflow-hidden"
        >
          <div
            class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-linear-to-r from-slate-50/80 to-white"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl text-base font-medium shadow-sm"
              :class="getCategoryAccent(catIndex)"
            >
              {{ category.icon }}
            </span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-600">
              {{ category.label }}
            </h2>
          </div>
          <div class="p-6">
            <div
              v-if="serviceStore.getServicesByCategory(category.id).length > 0"
              class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <div
                v-for="service in serviceStore.getServicesByCategory(category.id)"
                :key="service.id"
                class="group flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200/80 hover:shadow-md hover:shadow-violet-500/5"
                :class="getCategoryBorder(catIndex)"
              >
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-slate-900 truncate">
                    {{ service.name }}
                  </h3>
                  <p class="mt-1 text-sm font-medium text-violet-600">
                    {{ service.duration }} min · {{ service.price }}€
                  </p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-if="service.requiresTherapist"
                      class="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700"
                    >
                      {{ service.employeesCount ?? 1 }} {{ terminology.staffSingularLower }}(s)
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500"
                    >
                      Sin {{ terminology.staffPlural.toLowerCase() }}
                    </span>
                    <span
                      v-if="service.requiresCabin"
                      class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                    >
                      {{ cabinLabel }}
                    </span>
                  </div>
                </div>
                <div class="flex gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-violet-50 hover:text-violet-600"
                    title="Editar"
                    @click="editService(service)"
                  >
                    <span aria-hidden="true">✏️</span>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Eliminar"
                    @click="confirmDelete(service.id)"
                  >
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
            <p
              v-else
              class="py-6 text-center text-sm italic text-slate-400"
            >
              No hay servicios en esta categoría.
            </p>
          </div>
        </section>
      </div>
    </div>

    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar servicio' : 'Nuevo servicio'"
      variant="modern"
      @close="closeModal"
    >
      <form
        class="space-y-5"
        @submit.prevent="saveService"
      >
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo de servicio
          </label>
          <select
            v-model="form.category"
            required
            class="input-modern w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.icon }} {{ cat.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="input-modern w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            placeholder="Ej: Masaje relajante"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">
              Duración (min)
            </label>
            <input
              v-model.number="form.duration"
              type="number"
              min="1"
              required
              class="input-modern w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">
              Precio (€)
            </label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              class="input-modern w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Descripción (opcional)
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            class="input-modern w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            placeholder="Breve descripción del servicio"
          />
        </div>

        <div class="flex items-center gap-3">
          <input
            v-model="form.requiresCabin"
            type="checkbox"
            id="requiresCabin"
            class="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <label for="requiresCabin" class="text-sm font-medium text-slate-700">
            {{ cabinLabel }} por servicio
          </label>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <input
              v-model="form.requiresTherapist"
              type="checkbox"
              id="requiresTherapist"
              class="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <label for="requiresTherapist" class="text-sm font-medium text-slate-700">
              {{ terminology.staffPlural }} por servicio
            </label>
          </div>
          <div
            v-if="form.requiresTherapist"
            class="pl-7"
          >
            <label class="mb-1.5 block text-sm font-medium text-slate-600">
              Cuántos {{ terminology.staffSingularLower }}s
            </label>
            <input
              v-model.number="form.employeesCount"
              type="number"
              min="1"
              max="20"
              class="input-modern w-24 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton
            variant="outline"
            type="button"
            class="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            @click="closeModal"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            variant="accent"
            type="submit"
            class="rounded-xl"
          >
            {{ isEditing ? "Guardar cambios" : "Crear servicio" }}
          </BaseButton>
        </div>
      </form>
    </Modal>

    <Modal
      :is-open="isCategoryModalOpen"
      title="Nueva categoría"
      variant="modern"
      @close="closeCategoryModal"
    >
      <form
        class="space-y-5"
        @submit.prevent="saveCategory"
      >
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Nombre de la categoría
          </label>
          <input
            v-model="categoryForm.label"
            type="text"
            required
            class="input-modern w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            placeholder="Ej: Corte, Masajes, Consultas"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Icono (emoji)
          </label>
          <input
            v-model="categoryForm.icon"
            type="text"
            maxlength="4"
            class="input-modern w-20 text-2xl text-center rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            placeholder="📋"
          />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton
            variant="outline"
            type="button"
            class="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            @click="closeCategoryModal"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            variant="accent"
            type="submit"
            class="rounded-xl"
          >
            Crear categoría
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import Modal from "@/components/common/Modal.vue";
  import { useServiciosManager } from "@/composables/useServiciosManager";
  import { useBusinessTerminology } from "@/composables/useBusinessTerminology";
  import {
    getCategoryAccentClass,
    getCategoryBorderClass,
  } from "@/data/serviceCategoryDefaults";

  const {
    serviceStore,
    categories,
    isModalOpen,
    isEditing,
    form,
    openCreateModal,
    editService,
    closeModal,
    saveService,
    confirmDelete,
    isCategoryModalOpen,
    categoryForm,
    openCategoryModal,
    closeCategoryModal,
    saveCategory,
  } = useServiciosManager();

  const terminology = useBusinessTerminology();

  const cabinLabel = computed(() => terminology.value.resourceLabel);

  const getCategoryAccent = (index: number) => getCategoryAccentClass(index);
  const getCategoryBorder = (index: number) => getCategoryBorderClass(index);
</script>

<style scoped>
  .servicios-gestor {
    font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
  }
</style>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <BackLink
      :to="{ name: 'dashboard' }"
      label="Volver"
    />
    <div class="bg-app-surface rounded-2xl shadow-sm border border-app-border-subtle p-6 md:p-8">
      <h1 class="text-2xl font-bold text-app-title mb-4">Términos de uso</h1>
      <p class="text-sm text-app-text/80 leading-relaxed">
        Al utilizar Bokio aceptas las condiciones de uso del servicio. Esta página
        incluirá las condiciones generales, uso aceptable y limitación de
        responsabilidad. Contenido pendiente de redacción legal.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BackLink from "@/components/common/BackLink.vue";
</script>

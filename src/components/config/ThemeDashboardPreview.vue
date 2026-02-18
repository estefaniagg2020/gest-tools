<template>
  <div class="rounded-xl border border-app-border overflow-hidden bg-app-bg">
    <div class="px-3 py-2 border-b border-app-border-subtle flex items-center justify-between gap-2 bg-app-surface">
      <span class="text-xs font-semibold text-app-title">Vista previa</span>
      <span class="text-[10px] text-app-text/70">Panel</span>
    </div>
    <div class="p-3 space-y-3">
      <header class="flex items-center justify-between gap-2 border-b border-app-border-subtle pb-2">
        <div>
          <h2 class="text-sm font-semibold text-app-title">Panel de control</h2>
          <p class="text-[10px] text-app-text/60">lunes, 17 de febrero</p>
        </div>
        <span
          class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-brand-accent text-white"
        >
          ⚙️ Config
        </span>
      </header>
      <section class="rounded-lg border border-app-border-subtle bg-app-surface p-2.5">
        <div class="flex items-center justify-between gap-1 mb-2">
          <h3 class="text-xs font-semibold text-app-title">Mañana</h3>
          <span class="text-[10px] font-medium text-brand-accent">Ver agenda →</span>
        </div>
        <p class="text-[10px] text-app-text/70 mb-2">Resumen del día siguiente.</p>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="rounded-lg bg-app-bg/50 border border-app-border-subtle p-2">
            <p class="text-[9px] font-medium text-app-text/60 uppercase">Ocupación</p>
            <p class="text-sm font-bold text-brand-accent tabular-nums">72%</p>
          </div>
          <div class="rounded-lg bg-app-bg/50 border border-app-border-subtle p-2">
            <p class="text-[9px] font-medium text-app-text/60 uppercase">Bloques</p>
            <p class="text-sm font-bold text-app-title tabular-nums">4</p>
          </div>
        </div>
      </section>
      <section>
        <h3 class="text-[10px] font-semibold text-app-title mb-1.5">Accesos rápidos</h3>
        <div class="grid grid-cols-2 gap-1.5">
          <div
            class="flex items-center gap-2 rounded-lg border border-app-border bg-app-surface p-2"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm bg-app-border-subtle text-app-text">
              📅
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-medium text-app-title truncate">Calendario</p>
              <p class="text-[9px] text-app-text/60 truncate">Ver agenda</p>
            </div>
          </div>
          <div
            class="flex items-center gap-2 rounded-lg border border-app-border bg-app-surface p-2"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm bg-app-border-subtle text-app-text">
              ✂️
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-medium text-app-title truncate">Servicios</p>
              <p class="text-[9px] text-app-text/60 truncate">Catálogo</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

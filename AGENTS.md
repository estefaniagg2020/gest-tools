# AGENTS.md

Este documento define cómo trabajamos en este repositorio: estilo, arquitectura, performance, testing y convenciones.  
**Stack:** Vue 3 + TypeScript + pnpm + Vitest.

---

## 1) Principios no negociables

### Clean Code

- Nombres explícitos > comentarios.
- Funciones pequeñas: **1 intención** por función (una responsabilidad única).
- No mezclar en la misma función: IO (lectura/escritura de storage, red) y orquestación/lógica de estado. Si una función lee `localStorage` y además decide defaults y aplica estado, se viola la responsabilidad única: extraer la IO a un adapter.
- Complejidad ciclomática baja (evitar anidamientos profundos).
- Early returns y guard clauses.
- Evitar “boolean traps” (múltiples `boolean` en params); preferir objetos con propiedades nombradas.

### Performance-first (sin prematuridad)

- Medir antes de optimizar (profiling).
- Evitar renders innecesarios: computeds correctos, evitar watchers prescindibles.
- Minimizar trabajo en `watchEffect` y `watch`.
- Cargas perezosas (lazy) para rutas y features grandes.
- Evitar reactividad profunda innecesaria: preferir `shallowRef` / `markRaw` en objetos grandes no reactivos.
- Estructuras inmutables donde encaje: facilita memoización y test.

### SOLID + DRY + KISS

- SOLID aplicado a nivel de módulos/servicios.
- DRY sin obsesión: no abstraer sin motivo.
- KISS: primero una solución simple y correcta.

### Arquitectura Hexagonal (Ports & Adapters)

- El dominio no depende del framework ni de IO.
- Los casos de uso orquestan, el dominio decide, los adaptadores ejecutan.
- Sustituibilidad: cualquier adapter puede cambiar sin tocar dominio.

---

## 2) Arquitectura del proyecto

- **`infrastructure/`**: adapters que hablan con el mundo exterior (localStorage, HTTP, reloj). Solo IO: leer, escribir, deserializar. Sin lógica de negocio (p. ej. no deciden defaults; devuelven `null` o datos crudos).
- **`stores/`**: estado reactivo y orquestación. Los stores **no** contienen acceso directo a `localStorage` ni parseo de persistencia; llaman a adapters de `infrastructure/` para cargar/guardar. Funciones como `initialize` solo orquestan: "obtener datos del adapter o defaults → aplicar al estado".
- **`domain/`** (si aplica): reglas de negocio puras.
- **`application/`** (si aplica): casos de uso que orquestan dominio y adapters.
- **UI** (componentes, vistas, composables): consumen stores y composables; no hacen IO directo salvo que sea un adapter explícito.

## 3) Guía Vue (UI limpia y predecible)

### Componentes

- Componentes “tontos” (presentational) vs “listos” (container):
  - Presentational: solo props + emits.
  - Container/page: orquesta use cases y estado.
- Props inmutables; no mutar props.
- `emits` tipados; preferir eventos semánticos.

### Composables

- Un composable = una responsabilidad.
- Los composables no deben hacer IO directo salvo si son adapters explícitos en `infrastructure/`.
- Evitar composables “god”.

### Estado (stores)

- El store no debe contener lógica de dominio compleja: delegar a use cases/servicios de aplicación.
- El store **no** debe contener lógica de persistencia (no `localStorage.getItem/setItem`, no `JSON.parse` de datos guardados). Esa responsabilidad es de un adapter en `infrastructure/` (p. ej. `spaStorage.ts`). El store importa y usa ese adapter para cargar al iniciar y para guardar en cada mutación.
- Funciones de inicialización (`initialize`) tienen una sola responsabilidad: obtener estado inicial (desde adapter o defaults) y aplicarlo a los refs. No deben leer/parsear storage dentro del store.
- Acceso a store desde UI; dominio no conoce stores.

### Re-render control

- Evitar `computed` con efectos secundarios.
- Evitar watchers para derivar estado: preferir `computed`.
- Para listas grandes: key estable, virtualización si aplica.

---

## 4) TypeScript: normas de diseño

- `strict: true` (preferible).
- Tipos de dominio explícitos: `Money`, `UserId`, etc. (type aliases o branded types si aporta).
- Evitar `any` y `as` salvo en bordes (adapters).
- Preferir `unknown` en entradas externas; validar y transformar a tipos internos.
- No exportar tipos internos “accidentales”: API pública clara.

---

## 5) Testing (Vitest)

### Pirámide

1. **Unit** (dominio y casos de uso): rápidos, deterministas.
2. **Integration** (adapters): con mocks controlados o testcontainers si aplica.
3. **E2E** (si existe): pocos y críticos.

### Convenciones

- Arrange / Act / Assert (AAA).
- Testea comportamiento, no implementación.
- Nombrado: `should_<expected>_when_<context>`.
- Evitar snapshots para lógica; solo para UI estable y revisable.

### Mocking

- Mockear en los bordes: HTTP, storage, fecha/hora, random.
- No mockear lo que puedas construir real (dominio).

---

## 6) Estándares de código y revisiones

### Formato y lint

- Código consistente (formatter) + reglas de lint estrictas.
- Imports ordenados; sin imports muertos.
- Sin `console.log` en producción.
- En componentes (y en general en el front): preferir **arrow functions** para funciones locales: `const nombre = (params) => { ... }` en lugar de `function nombre(params) { ... }`.

### Pull Requests

- PR pequeño y enfocado.
- Checklist:
  - ✅ Compila
  - ✅ Tests pasan
  - ✅ No se rompe el contrato público
  - ✅ No hay deuda oculta (TODOs sin ticket)
  - ✅ Performance verificada si cambia render/loops/IO

### Commits

- Convencionales (recomendado): `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.
- Mensajes descriptivos, no “WIP”.

---

## 7) Manejo de errores

- Errores del dominio como tipos (clases o discriminated unions).
- En UI: mensajes de error user-friendly, logs técnicos fuera.
- No usar excepciones para control de flujo en dominio si se puede modelar.

---

## 8) API pública (si es librería o módulos reutilizables)

- Exportar desde un único `index.ts` por paquete/módulo.
- SemVer: cambios breaking bien identificados.
- Mantener compatibilidad y deprecaciones documentadas.
- Tipos y docs primero: la DX es parte del producto.

---

## 9) Performance checklist (antes de merge)

- ¿Hay loops sobre grandes colecciones en render/computed?
- ¿Hay watchers que podrían ser `computed`?
- ¿Se crean objetos/funciones nuevas en cada render sin necesidad?
- ¿Se puede memoizar/normalizar?
- ¿Hay lazy loading para rutas/features grandes?
- ¿La reactividad es la mínima necesaria?

---

## 10) Scripts esperados (pnpm)

Recomendación de scripts estándar (referencia):

- `pnpm dev`
- `pnpm build`
- `pnpm test` / `pnpm test:watch`
- `pnpm lint`
- `pnpm typecheck`

> Nota: el repo puede definirlos en `package.json`. Este documento solo fija expectativas.

---

## 11) Qué NO hacemos

- No metemos lógica de dominio en componentes Vue.
- No acoplamos casos de uso a Axios/fetch directamente.
- No ponemos lógica de persistencia (localStorage, parseo de storage) dentro del store: usar adapters en `infrastructure/`.
- No mezclamos en una misma función IO y orquestación/estado; cada una tiene una responsabilidad única.
- No introducimos dependencias pesadas sin justificar (bundle size).
- No optimizamos “a ojo” sin medir si es crítico.
- No usamos `any` como salida fácil.
- No ponemos comentarios en el código
- No hacemos funciones que rompan el princpio solid Single responsability

---

## 12) Definiciones rápidas

- **Dominio:** reglas de negocio puras.
- **Caso de uso:** orquestación (aplicación).
- **Puerto:** interfaz del dominio hacia el exterior.
- **Adapter:** implementación concreta (infra).
- **UI:** Vue, composición y experiencia de usuario.

---

**Si dudas dónde poner algo:**

- ¿Es regla de negocio? → `domain/`
- ¿Coordina pasos? → `application/use-cases/`
- ¿Habla con el mundo (HTTP/Storage/Clock)? → `infrastructure/` (adapters: solo IO, sin lógica de negocio).
- ¿Maneja estado reactivo y lo carga/guarda? → `stores/` usando adapters de `infrastructure/` para persistencia.
- ¿Renderiza/interactúa? → `ui/`

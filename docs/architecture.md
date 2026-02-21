# Arquitectura del sistema

gest-tools es un monorepo con dos paquetes principales: `client` (Vue 3) y `server` (Express + Prisma). La arquitectura sigue los principios de **Arquitectura Hexagonal (Ports & Adapters)**, **SOLID** y **Clean Code** tal como se define en [`AGENTS.md`](../AGENTS.md).

---

## Visión general

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (client/)                      │
│                                                              │
│  ┌──────────┐   ┌─────────────┐   ┌────────┐   ┌─────────┐ │
│  │  Views   │→  │ Composables │→  │ Stores │→  │  Infra  │ │
│  │ (páginas)│   │  (lógica)   │   │(Pinia) │   │(adapters│ │
│  └──────────┘   └─────────────┘   └────────┘   └────┬────┘ │
│                                                       │ HTTP  │
└───────────────────────────────────────────────────────┼──────┘
                                                        │
                              REST API (JSON)           │
                                                        ▼
┌──────────────────────────────────────────────────────────────┐
│                      BACKEND (server/)                       │
│                                                              │
│  ┌──────────┐   ┌────────────┐   ┌───────────┐   ┌───────┐ │
│  │  Routes  │→  │ Middleware │→  │ Prisma ORM│→  │  DB   │ │
│  │ (Express)│   │   (auth)   │   │  (models) │   │(PgSQL)│ │
│  └──────────┘   └────────────┘   └───────────┘   └───────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Puertos y proxy

| Servicio | Puerto | URL |
|---|---|---|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Express) | 3000 | http://localhost:3000 |

Las peticiones a `/api/*` desde el frontend se reenvían al backend mediante el proxy de Vite (`client/vite.config.ts`). Ver [`setup.md`](./setup.md#puertos-y-proxy) para más detalles.

---

## Frontend (`client/`)

### Capas

```
client/src/
├── views/              → Capa de presentación (páginas)
├── components/         → Componentes reutilizables (UI puro)
├── composables/        → Lógica de negocio y orquestación
├── stores/             → Estado global reactivo (Pinia)
├── infrastructure/     → Adapters: HTTP (API) y Storage (localStorage)
├── interfaces/         → Tipos y contratos TypeScript
├── router/             → Configuración de rutas (Vue Router)
└── main.ts             → Bootstrap de la app
```

### Responsabilidades por capa

#### `views/` — Composición pura
- Son **solo composición** de componentes.
- Importan un composable que orquesta la lógica de la vista.
- **No** contienen lógica de negocio, `ref`, `computed` ni llamadas directas a la API.

#### `components/` — UI presentacional
- Reciben datos vía **props** y emiten eventos vía **emits**.
- **No** acceden a stores ni a la API directamente.
- Componentes container (si es necesario): orquestan llamando a un composable y pasan resultados a componentes presentacionales.

#### `composables/` — Lógica de negocio
- Un composable = una responsabilidad.
- Usan stores y adapters de `infrastructure/`.
- Ejemplos: `useScheduleBlocks`, `useClientsManager`, `useBonosManager`, `useConfigHub`.

#### `stores/` — Estado reactivo global
- Estado compartido entre vistas y composables.
- **No** contienen lógica de persistencia directa; delegan en adapters de `infrastructure/`.
- Función `initialize()`: obtiene estado desde el adapter (o defaults) y lo aplica a los refs.

#### `infrastructure/` — Adapters (Ports & Adapters)
Dos tipos de adapters:

| Tipo | Ejemplos | Responsabilidad |
|---|---|---|
| **API adapters** | `appointmentsApi.ts`, `clientsApi.ts` | Llamadas HTTP al backend REST |
| **Storage adapters** | `authStorage.ts`, `spaStorage.ts` | Lectura/escritura en `localStorage` |

Los adapters **solo** hacen IO (leer, escribir, serializar). No contienen lógica de negocio.

### Flujo de datos (ejemplo: carga de citas)

```
SchedulerView
  └── useScheduleBlocks (composable)
        └── scheduleStore (Pinia)
              ├── scheduleBlocksApi.ts → GET /api/schedule-blocks
              └── schedulerSettingsStorage.ts → localStorage
```

---

## Backend (`server/`)

### Estructura

```
server/src/
├── index.ts            → Bootstrap: Express, Prisma, rutas
├── routes/             → 19 módulos de rutas (una por recurso)
├── middleware/         → auth.ts: requireAuth, requireStaff, requireAdmin
└── services/           → Servicios de dominio (availability, waitlist, whatsapp, IA)
```

### Módulos de rutas

| Ruta base | Archivo | Descripción |
|---|---|---|
| `/api/auth` | `auth.ts` | Login, registro, sesión |
| `/api/companies` | `companies.ts` | Empresas |
| `/api/businesses` | `businesses.ts` | Negocios/centros |
| `/api/employees` | `employees.ts` | Miembros del equipo |
| `/api/clients` | `clients.ts` | Clientes |
| `/api/appointments` | `appointments.ts` | Citas |
| `/api/bookings` | `bookings.ts` | Reservas |
| `/api/schedule-blocks` | `schedule-blocks.ts` | Bloques de horario |
| `/api/bonos` | `bonos.ts` | Bonos y packs |
| `/api/sales` | `sales.ts` | Ventas |
| `/api/inventory` | `inventory.ts` | Productos e inventario |
| `/api/service-categories` | `service-categories.ts` | Categorías de servicios |
| `/api/settings` | `settings.ts` | Configuración del negocio |
| `/api/dashboard` | `dashboard.ts` | Métricas del dashboard |
| `/api/waitlist` | `waitlist.ts` | Lista de espera |
| `/api/reminders` | `reminders.ts` | Recordatorios WhatsApp |
| `/api/professions` | `professions.ts` | Plantillas de profesión |
| `/api/ai` | `ai.ts` | Endpoints de IA |
| `/api/public` | `public.ts` | Endpoints públicos (sin auth) |

### Middleware de autenticación

```typescript
requireAuth      // Verifica Bearer token → adjunta req.user con businessId
requireStaff     // Solo roles: superadmin, admin, employee
requireAdmin     // Solo roles: superadmin, admin
requireSuperadmin // Solo rol: superadmin
```

El token de sesión se almacena en la tabla `User.sessionToken`. Cada request con `requireAuth` lo valida contra la BD.

### Inicialización del servidor

```
1. Carga variables de entorno (dotenv)
2. Crea pg.Pool con DATABASE_URL
3. Instancia PrismaClient con PrismaPg adapter
4. Configura Express (CORS, JSON, logger)
5. Monta las 19 rutas de la API
6. Ejecuta ensureProfessionTemplates() (seed de plantillas de IA)
7. Escucha en PORT (default: 3000)
```

---

## Base de datos

**Motor:** PostgreSQL 15 (via Docker)  
**ORM:** Prisma 7 con `@prisma/adapter-pg`

Ver [`database.md`](./database.md) para el esquema completo.

### Diseño del esquema

```
Company (1) ──→ (N) Business
Business (1) ──→ (N) WorkspaceMember
Business (1) ──→ (1) GestorConfig
Business (1) ──→ (N) Service, ServiceCategory
Business (1) ──→ (N) Client, Appointment
Business (1) ──→ (N) Bono, ScheduleBlock
Business (1) ──→ (N) Product, Supplier, Sale
```

---

## Patrones de diseño aplicados

### Hexagonal Architecture
- **Dominio:** lógica en composables y services, sin dependencias del framework.
- **Puertos:** interfaces TypeScript en `interfaces/`.
- **Adapters:** `infrastructure/` (HTTP y localStorage).

### Single Responsibility
- Cada composable, route handler y service tiene una única responsabilidad.
- Los stores no leen/escriben localStorage directamente.
- Las funciones de IO y orquestación están separadas.

### Dependency Inversion
- El store recibe el adapter como dependencia, no lo construye.
- Las rutas reciben `PrismaClient` como parámetro, facilitando el testing.

---

## Internacionalización (i18n)

El frontend usa `vue-i18n`. Los locales se almacenan en `client/src/` y el locale activo se persiste en `localStorage` via `localeStorage.ts`. El store `locale.ts` orquesta el cambio de idioma.

---

## Temas y configuración visual

- Los temas (colores, modo oscuro/claro) se gestionan desde el store `theme.ts`.
- La configuración visual (sidebar, módulos visibles, iconos) se guarda en `GestorConfig` en la BD via `gestorConfigStorage.ts` y `businessConfigApi.ts`.

---

## Testing

| Capa | Herramienta | Tipo |
|---|---|---|
| Frontend (unit) | Vitest + Vue Test Utils | Unitarios de composables y componentes |
| Backend (integration) | Vitest + Supertest | Tests de rutas y servicios |
| E2E | Playwright | Flujos completos en navegador |

Ver [`../README.md#testing`](../README.md#testing) para los comandos.

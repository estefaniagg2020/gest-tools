# gest-tools — Documentación completa del proyecto

Documento único que describe en detalle todo el proyecto **gest-tools** para su exposición en clase.

---

## 1. Introducción y propósito

**gest-tools** es un sistema de gestión integral para negocios de salud, belleza y bienestar (peluquerías, centros de estética, clínicas, spas, fisioterapia, etc.). Permite:

- Gestionar agenda, citas y bloques horarios
- Administrar clientes, equipo y servicios
- Controlar bonos, inventario y ventas
- Configurar el negocio (temas, idiomas, módulos)
- Ofrecer reserva pública online
- Usar IA para descubrir profesiones y parsear consultas de horarios

El proyecto está pensado como **multi-tenant**: cada negocio tiene sus propios datos aislados.

---

## 2. Stack tecnológico

### 2.1 Resumen

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS 4, vue-i18n |
| **Backend** | Node.js 20+, Express 5, Prisma 7, PostgreSQL 15 |
| **Monorepo** | pnpm workspaces |
| **Testing** | Vitest (unit/integration), Playwright (E2E) |
| **Base de datos** | PostgreSQL (Docker Compose en local) |

### 2.2 Dependencias principales

**Client:**
- `vue` 3.4, `vue-router` 4.4, `pinia` 2.1 — framework y estado
- `vite` 5.4 — bundler y dev server
- `tailwindcss` 4.1 — estilos
- `vue-i18n` 11.2 — internacionalización (ES, EN, DE, CA)

**Server:**
- `express` 5.2 — servidor HTTP
- `prisma` 7.4, `@prisma/client` 7.4, `@prisma/adapter-pg` 7.4 — ORM y adaptador PostgreSQL
- `pg` 8.18 — driver PostgreSQL
- `dotenv` 17.3 — variables de entorno
- `express-rate-limit` 8.2 — limitación de peticiones

---

## 3. Arquitectura general

### 3.1 Visión de alto nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue 3)                         │
│  Views → Composables → Stores → Infrastructure (adapters HTTP)   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express 5)                       │
│  Routes → Middleware (auth) → Services → Prisma                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Prisma 7)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Principios arquitectónicos

- **Arquitectura en capas**: separación entre vistas, composables, stores e infrastructure. No hay una capa de dominio pura ni puertos/adaptadores formales; los stores y composables dependen directamente de Pinia/Vue y de los adaptadores concretos.
- **Separación de responsabilidades**: vistas componen; composables orquestan; stores manejan estado; `infrastructure/` centraliza las llamadas HTTP y el storage.
- **Multi-tenant**: aislamiento por `businessId` del usuario autenticado.

---

## 4. Estructura del monorepo

```
gest-tools/
├── client/                 # Frontend Vue
│   ├── src/
│   │   ├── views/          # Páginas/vistas
│   │   ├── components/     # Componentes reutilizables
│   │   ├── composables/    # Lógica reutilizable
│   │   ├── stores/         # Estado global (Pinia)
│   │   ├── infrastructure/ # Adaptadores API y storage
│   │   ├── router/         # Rutas
│   │   ├── i18n/           # Traducciones
│   │   ├── data/           # Configuración estática
│   │   ├── interfaces/     # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/         # Endpoints por dominio
│   │   ├── middleware/     # Auth, etc.
│   │   ├── services/       # Lógica de dominio
│   │   ├── utils/          # Utilidades
│   │   └── prisma/         # Schema y migraciones
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de datos
│   │   ├── migrations/     # Migraciones SQL
│   │   └── seed.ts         # Datos iniciales
│   └── package.json
├── docs/                   # Documentación
├── docker-compose.yml      # PostgreSQL local
├── package.json            # Workspace raíz
└── AGENTS.md               # Normas de desarrollo
```

---

## 5. Frontend en detalle

### 5.1 Capas del frontend

| Capa | Responsabilidad | Ejemplos |
|------|-----------------|----------|
| **views/** | Composición de pantallas, wiring de componentes | `DashboardView.vue`, `SchedulerView.vue`, `ClientsView.vue` |
| **components/** | UI reutilizable, presentacional | `BaseButton.vue`, `AppLayout.vue`, `AppointmentEditorModal.vue` |
| **composables/** | Orquestación de lógica, un composable = una responsabilidad | `useClientsManager.ts`, `useScheduleBlocks.ts`, `useDashboard.ts` |
| **stores/** | Estado reactivo global (Pinia) | `auth.ts`, `client.ts`, `schedule.ts`, `gestorConfig.ts` |
| **infrastructure/** | Adaptadores de IO (API, localStorage) | `authApi.ts`, `clientsApi.ts`, `apiClient.ts`, `authStorage.ts` |
| **router/** | Definición de rutas y guards | `index.ts` |
| **interfaces/** | Contratos TypeScript | `client.ts`, `appointment.ts`, `auth.ts` |
| **data/** | Configuración estática | `layoutModules.ts`, `themes.ts`, `dashboardConfig.ts` |

### 5.2 Rutas de la aplicación

**Públicas (sin autenticación):**
- `/login` — Inicio de sesión
- `/setup` — Crear primer usuario (solo si no hay usuarios)
- `/forgot-password` — Recuperar contraseña
- `/b/:slug` — Perfil público del negocio (reserva online)

**Protegidas (requieren autenticación):**
- `/` — Dashboard
- `/scheduler` — Agenda (día/semana/mes)
- `/team` — Gestión de equipo
- `/services` — Servicios y categorías
- `/clients` — Clientes
- `/clients/:id` — Detalle de cliente
- `/inventory` — Inventario (si está habilitado)
- `/bonos` — Bonos y packs (si está habilitado)
- `/config` — Hub de configuración
- `/config/data` — Asistente de configuración inicial
- `/config/themes` — Temas y colores
- `/config/grid` — Layout del sidebar
- `/config/dashboard` — Widgets del dashboard
- `/config/agenda` — Configuración de agenda
- `/config/notifications` — Notificaciones
- `/config/icons` — Iconos de módulos
- `/config/language` — Idioma
- `/config/bonos` — Configuración de bonos
- `/config/billing` — Facturación e IVA
- `/config/modules` — Módulos activos (bonos, inventario, etc.)

**Legales:**
- `/privacy` — Política de privacidad
- `/terms` — Términos de uso
- `/legal-notice` — Aviso legal

### 5.3 Stores principales

| Store | Propósito |
|-------|-----------|
| `auth` | Usuario, sesión, login, register, hasAnyUser |
| `client` | Lista de clientes, CRUD |
| `schedule` | Bloques de agenda |
| `appointment` | Citas |
| `team` | Miembros del equipo |
| `service` / `serviceCategory` | Servicios y categorías |
| `bono` | Plantillas de bonos y bonos de clientes |
| `gestorConfig` | Configuración del negocio (temas, agenda, módulos) |
| `layout` | Sidebar, navbar, módulos visibles |
| `theme` | Tema activo |
| `locale` | Idioma activo |

### 5.4 Adaptadores de infraestructura

| Adapter | Propósito |
|---------|-----------|
| `apiClient.ts` | Cliente HTTP base, headers de auth |
| `authApi.ts` | login, register, logout, getMe, setup-status |
| `clientsApi.ts` | CRUD clientes |
| `appointmentsApi.ts` | CRUD citas |
| `scheduleBlocksApi.ts` | CRUD bloques |
| `employeeApi.ts` | CRUD equipo |
| `serviceCategoriesApi.ts` | Categorías y servicios |
| `bonosApi.ts` | Plantillas y bonos de clientes |
| `inventoryApi.ts` | Productos, proveedores, movimientos |
| `dashboardApi.ts` | Estadísticas del dashboard |
| `businessConfigApi.ts` | Configuración del negocio |
| `authStorage.ts` | Persistencia de sesión (localStorage) |
| `schedulerSettingsStorage.ts` | Preferencias de agenda |

### 5.5 Internacionalización

- Idiomas: español (ES), inglés (EN), alemán (DE), catalán (CA)
- Archivos en `client/src/i18n/locales/`
- Uso: `$t('clients.title')`, `t('auth.login')`

---

## 6. Backend en detalle

### 6.1 Estructura del servidor

```
server/src/
├── index.ts           # Punto de entrada, middlewares, registro de rutas
├── routes/            # Un archivo por dominio
│   ├── auth.ts
│   ├── clients.ts
│   ├── appointments.ts
│   ├── schedule-blocks.ts
│   ├── employees.ts
│   ├── dashboard.ts
│   ├── bonos.ts
│   ├── inventory.ts
│   ├── sales.ts
│   ├── service-categories.ts
│   ├── settings.ts
│   ├── waitlist.ts
│   ├── reminders.ts
│   ├── professions.ts
│   ├── ai.ts
│   ├── public.ts
│   ├── companies.ts
│   └── businesses.ts
├── middleware/
│   └── auth.ts        # requireAuth, requireStaff, requireAdmin
├── services/          # Lógica reutilizable
│   ├── ensureRoles.ts
│   ├── ensureTemplates.ts
│   ├── professionService.ts
│   ├── availability.ts
│   └── waitlist.ts
└── utils/
    └── password.ts    # hash, verify, salt, sessionToken
```

### 6.2 Autenticación y roles

- **Sesión**: token Bearer (`sessionToken`) en header `Authorization`
- **Roles**: `superadmin`, `admin`, `employee`, `client`
- **Middlewares**:
  - `requireAuth`: usuario autenticado
  - `requireStaff`: superadmin, admin o employee
  - `requireAdmin`: superadmin o admin
  - `requireSuperadmin`: solo superadmin
- **Permisos del módulo Equipo**:
  - `employee`: solo lectura del listado de miembros.
  - `admin` y `superadmin`: crear, editar y eliminar miembros.

### 6.3 Inicialización del servidor

1. Carga de variables de entorno (`dotenv`)
2. Pool de conexiones PostgreSQL (`pg.Pool`)
3. Prisma Client con adaptador `PrismaPg`
4. Middlewares: CORS, `express.json`, logger
5. Rutas montadas en `/api/*`
6. Seeds al arranque: `ensureRoleTemplates`, `ensureProfessionTemplates`
7. Servidor escuchando en `PORT` (por defecto 3000)

---

## 7. Base de datos

### 7.1 Motor y ORM

- **Motor**: PostgreSQL 15
- **ORM**: Prisma 7 con `@prisma/adapter-pg` (driver adapter)
- **Schema**: `server/prisma/schema.prisma`
- **Cliente generado**: `server/src/generated/prisma/`

### 7.2 Modelo de datos principal

```
Company (1) ──► (N) Business
Business (1) ──► (1) GestorConfig
Business (1) ──► (N) WorkspaceMember
Business (1) ──► (N) Client
Business (1) ──► (N) Appointment
Business (1) ──► (N) ScheduleBlock
Business (1) ──► (N) BusinessCategory ──► (N) BusinessService
Business (1) ──► (N) Bono ──► (N) ClientBono
Business (1) ──► (N) Product ──► (N) StockMovement
Business (1) ──► (N) Supplier
Business (1) ──► (N) Sale ──► (N) SaleItem
Business (1) ──► (N) SlotWaitlistEntry
User (1) ──► (N) WorkspaceMember
Role (1) ──► (N) User
Role (1) ──► (N) WorkspaceMember
```

### 7.3 Modelos clave

| Modelo | Propósito |
|--------|-----------|
| `Company` | Entidad organizativa madre |
| `Business` | Negocio operativo (tenant) |
| `GestorConfig` | Configuración del negocio (agenda, temas, módulos) |
| `User` | Credenciales y sesión |
| `Role` | Roles de acceso |
| `WorkspaceMember` | Miembros del equipo por negocio |
| `BusinessCategory` / `BusinessService` | Categorías y servicios |
| `Client` | Clientes |
| `Appointment` | Citas |
| `ScheduleBlock` | Bloques de agenda |
| `Bono` / `ClientBono` | Bonos y asignación a clientes |
| `Product` / `Supplier` / `StockMovement` | Inventario |
| `Sale` / `SaleItem` | Ventas |
| `Profession` / `ProfessionCategory` / `ProfessionService` | Catálogo de profesiones |

### 7.4 Enums relevantes

- `AppointmentStatus`: pending, confirmed, cancelled, completed, no_show
- `PaymentStatus`: pending, paid, refunded, partial
- `AppointmentOrigin`: manual, online, widget
- `BlockStatus`: active, cancelled
- `BonoType`: session_pack, time_pack, unlimited, loyalty
- `SaleStatus`: open, paid, refunded, voided
- `StockMovementType`: ADJUSTMENT, SALE, PURCHASE, USAGE, RETURN

---

## 8. API REST

### 8.1 Autenticación

```http
Authorization: Bearer <sessionToken>
```

### 8.2 Endpoints principales por dominio

| Dominio | Rutas base | Métodos típicos |
|---------|------------|-----------------|
| Auth | `/api/auth` | login, register, logout, me, setup-status, forgot-password |
| Clients | `/api/clients` | GET, POST, PUT, DELETE, search |
| Appointments | `/api/appointments` | GET, POST, PUT, DELETE |
| Schedule Blocks | `/api/schedule-blocks` | GET, POST, PUT, DELETE |
| Employees | `/api/employees` | GET, POST, PUT, DELETE |
| Dashboard | `/api/dashboard/stats` | GET |
| Bonos | `/api/bonos/templates`, `/api/bonos/client-bonos` | CRUD |
| Inventory | `/api/inventory` | CRUD, adjust, movements |
| Sales | `/api/sales` | CRUD, pay, void |
| Service Categories | `/api/service-categories` | CRUD |
| Settings | `/api/settings` | GET, PATCH |
| Waitlist | `/api/waitlist` | by-business, for-client, notifications |
| Professions | `/api/professions` | GET, search, discover |
| AI | `/api/ai/parse-slot-query` | POST (parseo de texto horario) |
| Public | `/api/public/business/:slug`, `/api/public/availability` | GET |

Referencia completa en `docs/backend/api-reference.md`.

---

## 9. Módulos funcionales

### 9.1 Autenticación

- Rutas: `/login`, `/setup`, `/forgot-password`
- Primer usuario: `/setup` crea superadmin y negocio
- Sesión: token Bearer persistido en localStorage

### 9.2 Dashboard

- Ruta: `/`
- KPIs: ocupación, horas, bloques, equipo
- Widgets configurables: reservas, ingresos, cancelaciones, clientes nuevos, waitlist, stock bajo, servicios populares

### 9.3 Agenda (Scheduler)

- Ruta: `/scheduler`
- Vistas: día, semana, mes
- Bloques de horario, citas, lista de espera
- Búsqueda de huecos, recordatorios

### 9.4 Equipo

- Ruta: `/team`
- Lectura del equipo para personal autenticado (`requireStaff`)
- Altas, edición, borrado y limpieza masiva solo para `admin`/`superadmin`
- Roles por negocio

### 9.5 Clientes

- Rutas: `/clients`, `/clients/:id`
- Búsqueda inteligente (por nombre, email, teléfono, «deuda», «no activo»)
- Filtro «Con bono activo» (si bonos habilitado)
- Historial de citas y bonos en detalle

### 9.6 Servicios

- Ruta: `/services`
- Categorías y servicios por negocio
- Plantillas desde catálogo de profesiones
- Descubrimiento con IA

### 9.7 Bonos

- Ruta: `/bonos` (si `bonosEnabled`)
- Plantillas: packs de sesiones, loyalty, etc.
- Asignación a clientes
- Consumo de sesiones en citas

### 9.8 Inventario

- Ruta: `/inventory` (si `inventarioEnabled`)
- Productos, proveedores, movimientos de stock
- Alertas de stock bajo

### 9.9 Configuración

- Hub: `/config`
- Subrutas: datos iniciales, temas, grid, dashboard, agenda, notificaciones, iconos, idioma, bonos, facturación, módulos
- Módulos activables: bonos, inventario, servicios

### 9.10 Reserva pública

- Ruta: `/b/:slug`
- Perfil público del negocio
- Disponibilidad y reserva online (si `bookingEnabled`)

### 9.11 IA

- Descubrimiento de profesiones: `POST /api/professions/discover`
- Parseo de texto horario: `POST /api/ai/parse-slot-query` (ej: «lunes de 9 a 14»)

---

## 10. Integración frontend-backend

### 10.1 Flujo de datos

```
Vue View → Composable → Store → Infrastructure API adapter
                                    │
                                    ▼
                            HTTP /api/* (Express)
                                    │
                                    ▼
                          Route → Service → Prisma → PostgreSQL
```

### 10.2 Mapa de enlace por dominio

| Dominio | Frontend | Backend |
|---------|----------|---------|
| Auth | `stores/auth.ts`, `authApi.ts` | `/api/auth` |
| Dashboard | `useDashboardBookingStats`, `dashboardApi` | `/api/dashboard/stats` |
| Agenda | `SchedulerView`, `schedule`, `appointment` | `/api/schedule-blocks`, `/api/appointments` |
| Equipo | `TeamManagerView`, `useTeamManager` | `/api/employees` |
| Clientes | `ClientsView`, `useClientsManager` | `/api/clients` |
| Servicios | `ServicesView`, `service`, `serviceCategory` | `/api/service-categories`, `/api/businesses/:id/services` |
| Bonos | `BonosView`, `bono` | `/api/bonos/*` |
| Inventario | `InventoryView`, `useInventoryManager` | `/api/inventory` |
| Config | `gestorConfig`, `businessConfigApi` | `/api/settings`, `/api/businesses/:id/config` |
| Público | `BusinessProfileView` | `/api/public/*` |

### 10.3 Proxy en desarrollo

Vite hace proxy de `/api/*` a `http://localhost:3000` para evitar CORS.

---

## 11. Instalación y ejecución

### 11.1 Requisitos

- Node.js 20+
- pnpm 9+
- Docker y Docker Compose 2+

### 11.2 Pasos

```bash
git clone <repo-url> gest-tools
cd gest-tools
pnpm install
```

Crear `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gest_tools"
PORT=3000
```

```bash
docker compose up -d
pnpm --filter server prisma:migrate
pnpm --filter server prisma:seed
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: http://localhost:3000/health

### 11.3 Scripts útiles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Frontend + backend en paralelo |
| `pnpm dev:client` | Solo frontend |
| `pnpm dev:server` | Solo backend |
| `pnpm build` | Build de client y server |
| `pnpm test` | Tests unitarios |
| `pnpm test:coverage` | Cobertura |
| `pnpm test:e2e` | Tests E2E (Playwright) |
| `pnpm typecheck` | Verificación TypeScript |
| `pnpm format` | Formateo con Prettier |

---

## 12. Testing

- **Unit/Integration**: Vitest (client y server)
- **E2E**: Playwright
- **Convenciones**: Arrange/Act/Assert, `should_<expected>_when_<context>`
- **Mocking**: en bordes (HTTP, storage), no en dominio

---

## 13. Convenciones de desarrollo

Definidas en `AGENTS.md`:

- **Clean Code**: nombres explícitos, funciones pequeñas, responsabilidad única
- **Arquitectura en capas**: separación de vistas, composables, stores e infrastructure
- **Vue**: vistas solo componen; composables orquestan; stores manejan estado
- **TypeScript**: strict, tipos explícitos, evitar `any`
- **Commits**: convencionales (`feat:`, `fix:`, `refactor:`, etc.)

---

## 14. Variables de entorno

### Server (`server/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL |
| `PORT` | Puerto HTTP (default 3000) |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos |
| `CRON_SECRET` | Protección de `/api/reminders/send` |
| `WHATSAPP_ACCESS_TOKEN` | Integración WhatsApp |
| `GEMINI_API_KEY` | IA para profesiones |

### Client (`client/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del API (opcional si se usa proxy) |

---

## 15. Resumen para la exposición

**gest-tools** es un sistema de gestión para negocios de bienestar construido como monorepo con:

- **Frontend** Vue 3 + TypeScript con arquitectura en capas
- **Backend** Express 5 + Prisma 7 + PostgreSQL
- **Módulos**: agenda, clientes, equipo, servicios, bonos, inventario, ventas, configuración
- **Multi-tenant** por negocio
- **Reserva pública** y **IA** para profesiones y horarios
- **Internacionalización** en 4 idiomas
- **Testing** con Vitest y Playwright

El proyecto aplica principios de Clean Code y SOLID, con documentación y normas de desarrollo definidas en `AGENTS.md` y en la carpeta `docs/`.

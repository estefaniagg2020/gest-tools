# gest-tools

Sistema de gestión integral para negocios de salud, belleza y bienestar (peluquerías, centros de estética, clínicas, spas, fisioterapia, etc.).

---

## Índice

1. [Cómo hacer funcionar la aplicación](#1-cómo-hacer-funcionar-la-aplicación)
2. [Requisitos](#2-requisitos)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Arquitectura](#5-arquitectura)
6. [Módulos funcionales](#6-módulos-funcionales)
7. [Rutas de la aplicación](#7-rutas-de-la-aplicación)
8. [Base de datos](#8-base-de-datos)
9. [API REST](#9-api-rest)
10. [Variables de entorno](#10-variables-de-entorno)
11. [Scripts y comandos](#11-scripts-y-comandos)
12. [Testing](#12-testing)
13. [Solución de problemas](#13-solución-de-problemas)
14. [Documentación adicional](#14-documentación-adicional)

---

## 1. Cómo hacer funcionar la aplicación

### Paso 1: Clonar e instalar

```bash
git clone <repo-url> gest-tools
cd gest-tools
pnpm install
```

### Paso 2: Configurar variables de entorno

Crear el archivo `server/.env` con:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gest_tools"
PORT=3000
```

> **Nota:** Las credenciales `user` y `password` coinciden con las del `docker-compose.yml`. Para producción, usa una URL de base de datos distinta y configúrala en las variables de entorno del hosting.

### Paso 3: Levantar la base de datos

```bash
docker compose up -d
```

### Paso 4: Ejecutar migraciones y seed

```bash
pnpm --filter server prisma:generate
pnpm --filter server prisma:migrate
pnpm --filter server prisma:seed
```

### Paso 5: Arrancar la aplicación

```bash
pnpm dev
```

**URLs:**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Health check:** http://localhost:3000/health

### Primer uso

1. Abre http://localhost:5173
2. Si no hay usuarios, irás a `/setup` para crear el primer usuario (superadmin)
3. Si ya hay usuarios, irás a `/login` para iniciar sesión

---

## 2. Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker | 24+ |
| Docker Compose | 2+ |

---

## 3. Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS 4, vue-i18n |
| **Backend** | Node.js 20+, Express 5, Prisma 7, PostgreSQL 15 |
| **Monorepo** | pnpm workspaces |
| **Testing** | Vitest (unit/integration), Playwright (E2E) |
| **Base de datos** | PostgreSQL (Docker Compose en local) |

---

## 4. Estructura del proyecto

```
gest-tools/
├── client/                 # Frontend Vue
│   ├── src/
│   │   ├── views/          # Páginas/vistas
│   │   ├── components/     # Componentes reutilizables
│   │   ├── composables/    # Lógica reutilizable
│   │   ├── stores/         # Estado global (Pinia)
│   │   ├── infrastructure/ # Llamadas HTTP y storage
│   │   ├── router/         # Rutas
│   │   ├── i18n/           # Traducciones (ES, EN, DE, CA)
│   │   ├── data/           # Configuración estática
│   │   ├── interfaces/     # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   └── vite.config.ts
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/         # Endpoints por dominio
│   │   ├── middleware/     # Auth, etc.
│   │   ├── services/       # Lógica reutilizable
│   │   └── utils/          # Utilidades
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de datos
│   │   ├── migrations/     # Migraciones SQL
│   │   └── seed.ts         # Datos iniciales
│   └── prisma.config.ts
├── docs/                   # Documentación
├── docker-compose.yml      # PostgreSQL local
├── package.json            # Workspace raíz
└── AGENTS.md               # Normas de desarrollo
```

---

## 5. Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue 3)                          │
│  Views → Composables → Stores → Infrastructure (HTTP/storage)    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express 5)                       │
│  Routes → Middleware (auth) → Services → Prisma                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Prisma 7)                        │
└─────────────────────────────────────────────────────────────────┘
```

- **Arquitectura en capas:** separación entre vistas, composables, stores e infrastructure. Los stores manejan estado; `infrastructure/` centraliza las llamadas HTTP y el storage.
- **Multi-tenant:** aislamiento por `businessId` del usuario autenticado.
- **Proxy en desarrollo:** Vite hace proxy de `/api/*` a `http://localhost:3000` para evitar CORS.

---

## 6. Módulos funcionales

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Autenticación** | `/login`, `/setup`, `/forgot-password` | Login, primer usuario, recuperar contraseña |
| **Dashboard** | `/` | KPIs, ocupación, widgets configurables |
| **Agenda** | `/scheduler` | Vistas día/semana/mes, bloques, citas, waitlist |
| **Equipo** | `/team` | CRUD de miembros del equipo |
| **Clientes** | `/clients`, `/clients/:id` | Búsqueda, CRUD, historial |
| **Servicios** | `/services` | Categorías y servicios por negocio |
| **Bonos** | `/bonos` | Plantillas y asignación a clientes (si habilitado) |
| **Inventario** | `/inventory` | Productos, proveedores, stock (si habilitado) |
| **Configuración** | `/config` | Temas, agenda, idioma, módulos, facturación |
| **Reserva pública** | `/b/:slug` | Perfil público y reserva online |
| **IA** | API | Descubrimiento de profesiones, parseo de horarios |

---

## 7. Rutas de la aplicación

**Públicas:** `/login`, `/setup`, `/forgot-password`, `/b/:slug`

**Protegidas:** `/`, `/scheduler`, `/team`, `/services`, `/clients`, `/clients/:id`, `/inventory`, `/bonos`, `/config`, `/config/*`

**Legales:** `/privacy`, `/terms`, `/legal-notice`

---

## 8. Base de datos

- **Motor:** PostgreSQL 15
- **ORM:** Prisma 7 con `@prisma/adapter-pg`
- **Schema:** `server/prisma/schema.prisma`

**Modelo principal:**
```
Company (1) ──► (N) Business
Business (1) ──► (1) GestorConfig
Business (1) ──► (N) WorkspaceMember, Client, Appointment, ScheduleBlock
Business (1) ──► (N) BusinessCategory ──► (N) BusinessService
Business (1) ──► (N) Bono ──► (N) ClientBono
Business (1) ──► (N) Product, Supplier, Sale, SlotWaitlistEntry
User (1) ──► (N) WorkspaceMember
Role (1) ──► (N) User
```

---

## 9. API REST

**Autenticación:** `Authorization: Bearer <sessionToken>`

**Endpoints principales:** `/api/auth`, `/api/clients`, `/api/appointments`, `/api/schedule-blocks`, `/api/employees`, `/api/dashboard/stats`, `/api/bonos`, `/api/inventory`, `/api/sales`, `/api/service-categories`, `/api/settings`, `/api/waitlist`, `/api/professions`, `/api/ai`, `/api/public`

Referencia completa: `docs/backend/api-reference.md`

---

## 10. Variables de entorno

### Server (`server/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL (obligatoria) |
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

## 11. Scripts y comandos

### Raíz

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

### Backend

```bash
pnpm --filter server prisma:generate   # Regenerar cliente Prisma
pnpm --filter server prisma:migrate     # Migraciones
pnpm --filter server prisma:seed        # Seed de datos
pnpm --filter server reset-db           # Reset completo de BD
pnpm --filter server clear-db-keep-categories
pnpm --filter server clear-user-data
pnpm --filter server clear-appointments
```

---

## 12. Testing

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
```

- **Unit/Integration:** Vitest (client y server)
- **E2E:** Playwright

---

## 13. Solución de problemas

### `DATABASE_URL` no definida
Verifica que existe `server/.env` con la variable correcta.

### Error de conexión a PostgreSQL
```bash
docker compose ps
docker compose logs db
```

### Error de migración `P1001`
La base de datos aún no está lista. Espera unos segundos y repite.

### Puerto ocupado (5173 o 3000)
- Frontend: ajustar `client/vite.config.ts`
- Backend: ajustar `PORT` en `server/.env`

### Error "PrismaClient does not provide an export named 'PrismaClient'"
Ejecuta:

```bash
pnpm --filter server prisma:generate
```

### Base de datos local vs producción
- **Local:** usa `DATABASE_URL` en `server/.env` apuntando a `localhost:5432`
- **Producción:** configura `DATABASE_URL` en las variables de entorno del hosting (Railway, etc.). El archivo `.env` está en `.gitignore` y no se despliega.

---

## 14. Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| `docs/README.md` | Índice de documentación |
| `docs/PROYECTO-COMPLETO.md` | Documentación detallada para exposición |
| `docs/overview/setup.md` | Guía de instalación |
| `docs/integration/architecture.md` | Arquitectura global |
| `docs/integration/front-back-link.md` | Mapa frontend-backend |
| `docs/backend/architecture.md` | Arquitectura del backend |
| `docs/backend/api-reference.md` | Referencia completa de la API |
| `docs/backend/database.md` | Modelo de datos |
| `docs/product/features.md` | Módulos funcionales |
| `docs/frontend/*` | Documentación de vistas |
| `AGENTS.md` | Normas de desarrollo |

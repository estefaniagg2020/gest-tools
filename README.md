# gest-tools

Sistema de gestión integral para negocios de salud, belleza y bienestar. Cubre agenda, equipo, clientes, servicios, bonos, inventario, ventas y configuración avanzada del negocio.

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Características principales](#características-principales)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Puertos y proxy](#puertos-y-proxy)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Arquitectura](#arquitectura)
- [Documentación](#documentación)
- [Testing](#testing)

---

## Stack tecnológico

### Frontend (`client/`)
| Tecnología | Rol |
|---|---|
| Vue 3 (Composition API) | Framework UI |
| TypeScript | Tipado estático |
| Vite | Bundler y dev server |
| Pinia | Estado global reactivo |
| Vue Router | Enrutamiento SPA |
| TanStack Vue Query | Fetching y caché de datos del servidor |
| Tailwind CSS 4 | Estilos utilitarios |
| vue-i18n | Internacionalización |
| Vitest | Tests unitarios |
| Playwright | Tests E2E |

### Backend (`server/`)
| Tecnología | Rol |
|---|---|
| Node.js + TypeScript | Runtime y lenguaje |
| Express.js 5 | Framework HTTP |
| Prisma 7 | ORM |
| PostgreSQL 15 | Base de datos relacional |
| `@prisma/adapter-pg` | Driver adapter para pg |
| Vitest + Supertest | Tests de integración |

### Infraestructura
| Tecnología | Rol |
|---|---|
| Docker / Docker Compose | PostgreSQL en contenedor |
| pnpm workspaces | Monorepo y gestión de paquetes |

---

## Características principales

| Módulo | Descripción |
|---|---|
| **Autenticación** | Login, registro, sesiones con token, roles (superadmin, admin, employee, client) |
| **Dashboard** | Métricas KPI, gráficos de ingresos, widgets configurables |
| **Agenda** | Vista día/semana/mes, bloques de horario, flujo de aprobación manager/empleado |
| **Equipo** | CRUD de miembros del equipo, roles, perfiles |
| **Clientes** | CRUD, historial, fotos, gestión de bonos del cliente |
| **Servicios** | Catálogo de servicios por categoría, duración, precio, plantillas por profesión (IA) |
| **Bonos** | Packs de sesiones, tiempo, ilimitados y fidelización |
| **Inventario** | Productos, stock, movimientos, proveedores, alertas de stock mínimo |
| **Ventas** | TPV (carrito), múltiples métodos de pago, historial de ventas |
| **Citas** | Creación manual y online, estados, pagos parciales y depósitos |
| **Lista de espera** | Entradas de waitlist con notificación automática al liberar hueco |
| **Reserva online** | Widget público en `/b/:slug` para reservas de clientes |
| **Configuración** | Hub de configuración: tema, agenda, dashboard, módulos, notificaciones WhatsApp, facturación |
| **IA** | Detección automática de profesión, parsing de franjas horarias |

---

## Estructura del repositorio

```
gest-tools/
├── client/                    # Frontend Vue 3
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── composables/       # Lógica de negocio (hooks)
│   │   ├── infrastructure/    # Adapters HTTP y storage
│   │   ├── stores/            # Estado global (Pinia)
│   │   ├── views/             # Páginas / vistas
│   │   ├── router/            # Vue Router
│   │   ├── interfaces/        # Tipos TypeScript
│   │   └── main.ts            # Punto de entrada
│   └── package.json
├── server/                    # Backend Express
│   ├── src/
│   │   ├── routes/            # Rutas de la API (19 módulos)
│   │   ├── middleware/        # Auth middleware
│   │   └── services/          # Servicios de dominio
│   ├── prisma/
│   │   └── schema.prisma      # Esquema de base de datos
│   └── package.json
├── docs/                      # Documentación técnica y funcional
├── docker-compose.yml         # PostgreSQL en Docker
├── pnpm-workspace.yaml        # Configuración monorepo
├── AGENTS.md                  # Reglas de arquitectura y desarrollo
└── package.json               # Scripts raíz del workspace
```

---

## Requisitos previos

- **Node.js** 20 o superior
- **pnpm** 9 o superior (`npm install -g pnpm`)
- **Docker** y **Docker Compose** (para la base de datos)

---

## Instalación y puesta en marcha

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url> gest-tools
cd gest-tools
pnpm install
```

### 2. Variables de entorno

Crea el fichero `server/.env` a partir del ejemplo:

```bash
cp server/.env.example server/.env
```

> Si no existe `.env.example`, crea `server/.env` con el contenido indicado en la sección [Variables de entorno](#variables-de-entorno).

### 3. Levantar la base de datos

```bash
docker compose up -d
```

Levanta PostgreSQL en `localhost:5432` (usuario: `user`, contraseña: `password`, base de datos: `gest_tools`).

### 4. Migraciones y seed

```bash
pnpm --filter server prisma:migrate    # aplica las migraciones
pnpm --filter server prisma:seed       # datos iniciales (roles, plantillas de profesión)
```

### 5. Iniciar el entorno de desarrollo

```bash
pnpm dev
```

Esto arranca en paralelo:
- **Frontend** → `http://localhost:5173`
- **Backend** → `http://localhost:3000`

#### Puertos y proxy

El frontend y el backend corren en puertos distintos para evitar conflictos:

| Servicio | Puerto | URL |
|---|---|---|
| **Frontend** (Vite) | 5173 | http://localhost:5173 |
| **Backend** (Express) | 3000 | http://localhost:3000 |
| **Health check** | 3000 | http://localhost:3000/health |

Las peticiones a `/api/*` desde el frontend se reenvían automáticamente al backend mediante el proxy de Vite (`client/vite.config.ts`). No hace falta configurar `VITE_API_URL` en desarrollo.

Para arrancar por separado:
- `pnpm dev:client` — solo frontend (puerto 5173)
- `pnpm dev:server` — solo backend (puerto 3000)

---

## Variables de entorno

### `server/.env`

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/gest_tools"

# Puerto del servidor (opcional, por defecto 3000)
PORT=3000
```

### `client/.env` (opcional)

```env
# URL base de la API (por defecto http://localhost:3000)
VITE_API_BASE_URL=http://localhost:3000
```

---

## Scripts disponibles

### Raíz del monorepo

```bash
pnpm dev              # Frontend + Backend en paralelo
pnpm dev:client       # Solo frontend
pnpm dev:server       # Solo backend
pnpm build            # Build de producción (cliente + servidor)
pnpm test             # Todos los tests (cliente + servidor)
pnpm test:client      # Tests del frontend
pnpm test:server      # Tests del backend
pnpm test:coverage    # Cobertura completa
pnpm test:e2e         # Tests E2E (Playwright)
pnpm typecheck        # Verificación de tipos TypeScript
pnpm format           # Formateo de código (Prettier)
```

### Backend (`server/`)

```bash
pnpm --filter server dev              # Servidor con hot-reload (tsx watch)
pnpm --filter server prisma:migrate   # Ejecutar migraciones de BD
pnpm --filter server prisma:seed      # Seed de datos iniciales
pnpm --filter server prisma:generate  # Regenerar cliente Prisma
```

---

## Arquitectura

El proyecto sigue **Arquitectura Hexagonal (Ports & Adapters)**:

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Vue 3)                    │
│                                                         │
│  Views → Composables → Stores → Infrastructure (adapters) │
│                                    ↓                    │
│              HTTP (REST API)                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                    │
│                                                         │
│  Routes → Middleware → Prisma ORM → PostgreSQL          │
└─────────────────────────────────────────────────────────┘
```

**Capas del frontend:**

| Capa | Responsabilidad |
|---|---|
| `views/` | Composición de componentes, sin lógica propia |
| `composables/` | Lógica de negocio y orquestación de estado |
| `stores/` | Estado reactivo global (Pinia); usa adapters para persistencia |
| `infrastructure/` | Adapters HTTP (API calls) y storage (localStorage) |
| `components/` | Componentes presentacionales puros (props + emits) |

Ver [`AGENTS.md`](./AGENTS.md) para el conjunto completo de reglas de arquitectura y código.

---

## Documentación

La carpeta [`docs/`](./docs/) contiene documentación técnica y funcional detallada:

| Documento | Contenido |
|---|---|
| [`docs/README.md`](./docs/README.md) | Índice de documentación |
| [`docs/setup.md`](./docs/setup.md) | Guía de instalación detallada |
| [`docs/architecture.md`](./docs/architecture.md) | Arquitectura completa (frontend + backend) |
| [`docs/api-reference.md`](./docs/api-reference.md) | Referencia de todos los endpoints de la API |
| [`docs/database.md`](./docs/database.md) | Esquema de base de datos y relaciones |
| [`docs/features.md`](./docs/features.md) | Descripción detallada de cada módulo |
| [`docs/backend-architecture.md`](./docs/backend-architecture.md) | Decisiones técnicas del backend |

---

## Testing

```bash
pnpm test             # Todos los tests
pnpm test:coverage    # Con reporte de cobertura
pnpm test:e2e         # Tests end-to-end (Playwright)
```

Los tests siguen la convención **AAA (Arrange / Act / Assert)** y el patrón de nombres `should_<expected>_when_<context>`.

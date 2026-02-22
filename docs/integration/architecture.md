# Arquitectura del sistema

`gest-tools` es un monorepo con dos paquetes: `client/` (Vue 3 + TypeScript) y `server/` (Express + Prisma + PostgreSQL).

## Visión global

```text
Frontend (Vue)
Views -> Composables -> Stores -> Infrastructure (HTTP/storage adapters)
                        |
                        v
                 REST API (Express)
                        |
                        v
                 Prisma -> PostgreSQL
```

## Frontend (`client/src`)

| Capa | Responsabilidad |
|---|---|
| `views/` | Composición de pantalla y wiring de componentes |
| `components/` | UI reutilizable |
| `composables/` | Orquestación de lógica de interacción |
| `stores/` | Estado reactivo global (Pinia) |
| `infrastructure/` | Adaptadores de IO (API/storage) |
| `router/` | Definición de navegación |
| `interfaces/` | Contratos TypeScript |

## Backend (`server/src`)

| Capa | Responsabilidad |
|---|---|
| `routes/` | Endpoints HTTP por dominio |
| `middleware/` | Autenticación/autorización |
| `services/` | Lógica de dominio reutilizable |
| `prisma/` | Modelo de datos y migraciones |

## Decisiones arquitectónicas

- Se aplica orientación hexagonal como objetivo de diseño (separación de dominio e IO).
- `infrastructure/` en frontend centraliza adaptadores de API y storage.
- Backend modular por rutas, con `PrismaClient` inyectado en cada router.

## Estado real vs objetivo

La base sigue el diseño definido en `../../AGENTS.md`, pero hay zonas en transición y deuda técnica documentadas en `../audits/configuration-persistence-audit.md`.

## Puertos locales

- Frontend: `5173`
- Backend: `3000`

El frontend usa proxy de Vite para `/api/*` en desarrollo.

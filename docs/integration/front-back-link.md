# Integración Frontend-Backend

Este documento describe cómo se conectan las capas de `client` y `server`.

## Flujo principal

```text
Vue View -> Composable -> Store -> Infrastructure API adapter
                                      |
                                      v
                              HTTP /api/* (Express)
                                      |
                                      v
                                Route -> Service -> Prisma -> PostgreSQL
```

## Puntos de enlace por dominio

| Dominio | Frontend | Backend |
|---|---|---|
| Auth | `stores/auth.ts`, `infrastructure/authApi.ts` | `/api/auth` (`server/src/routes/auth.ts`) |
| Dashboard | `views/DashboardView.vue`, `composables/useDashboardBookingStats.ts` | `/api/dashboard/stats` (`server/src/routes/dashboard.ts`) |
| Agenda | `views/SchedulerView.vue`, `stores/schedule.ts` | `/api/appointments`, `/api/schedule-blocks` |
| Equipo | `views/TeamManagerView.vue`, `composables/useTeamManager.ts` | `/api/employees` |
| Clientes | `views/ClientsView.vue`, `composables/useClientsManager.ts` | `/api/clients` |
| Servicios | `views/ServicesView.vue`, `stores/service.ts` | `/api/service-categories`, `/api/businesses/:id/services` |
| Bonos | `views/BonosView.vue`, `composables/useBonosManager.ts` | `/api/bonos/*` |
| Inventario | `views/InventoryView.vue`, `composables/useInventoryManager.ts` | `/api/inventory*` |
| Configuración | `stores/gestorConfig.ts`, `infrastructure/businessConfigApi.ts` | `/api/settings`, `/api/businesses/:id/config` |
| Público | `views/public/BusinessProfileView.vue` | `/api/public/*` |

## Convenciones de integración

- Frontend consume backend vía `client/src/infrastructure/*Api.ts`.
- Stores centralizan estado de UI y sincronización de datos.
- El backend responde JSON y usa `{ error: string }` para errores.
- El token se envía en `Authorization: Bearer <sessionToken>` en rutas protegidas.

## Dónde mirar

- Mapa global: `docs/integration/architecture.md`
- Endpoints reales: `docs/backend/api-reference.md`
- Modelo de datos: `docs/backend/database.md`

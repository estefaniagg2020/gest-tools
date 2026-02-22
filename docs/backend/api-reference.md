# Referencia de la API REST

URL base: `http://localhost:3000`

## Autenticación

Para rutas protegidas:

```http
Authorization: Bearer <sessionToken>
```

### Middlewares

| Middleware | Significado |
|---|---|
| `requireAuth` | Usuario autenticado con token válido |
| `requireStaff` | Rol `superadmin`, `admin` o `employee` |
| `requireAdmin` | Rol `superadmin` o `admin` |
| `requireSuperadmin` | Rol `superadmin` |

## Health

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/health` | No |

## Auth (`/api/auth`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/auth/setup-status` | No |
| `POST` | `/api/auth/login` | No |
| `POST` | `/api/auth/register` | No |
| `POST` | `/api/auth/forgot-password` | No |
| `POST` | `/api/auth/change-password` | `requireAuth` |
| `POST` | `/api/auth/logout` | `requireAuth` |
| `GET` | `/api/auth/me` | `requireAuth` |
| `PATCH` | `/api/auth/me` | `requireAuth` |

## Companies (`/api/companies`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/companies` | No |
| `POST` | `/api/companies` | No |

## Businesses (`/api/businesses`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/businesses` | No |
| `POST` | `/api/businesses` | No |
| `GET` | `/api/businesses/:id/catalog` | No |
| `GET` | `/api/businesses/:id/services` | No |
| `POST` | `/api/businesses/:id/services` | No |
| `PUT` | `/api/businesses/:id/services/:serviceId` | No |
| `DELETE` | `/api/businesses/:id/services/:serviceId` | No |
| `GET` | `/api/businesses/:id/availability` | No |
| `GET` | `/api/businesses/:id/occupied-slots` | No |
| `GET` | `/api/businesses/:id/config` | No |
| `PUT` | `/api/businesses/:id/config` | No |

Notas:
- `GET /availability` requiere query params `date` (YYYY-MM-DD) y `serviceId`.
- `GET /availability` soporta `smart=1|true`.
- `GET /occupied-slots` requiere `date` y `serviceId`.

## Employees (`/api/employees`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/employees` | `requireAuth + requireStaff` |
| `POST` | `/api/employees` | `requireAuth + requireAdmin` |
| `PUT` | `/api/employees/:id` | `requireAuth + requireAdmin` |
| `DELETE` | `/api/employees/:id` | `requireAuth + requireAdmin` |

Regla de permisos del módulo equipo:
- `employee` puede consultar el equipo (solo lectura).
- Solo `admin` y `superadmin` pueden crear, editar o eliminar miembros.

## Clients (`/api/clients`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/clients/search` | `requireAuth + requireStaff` |
| `GET` | `/api/clients` | `requireAuth + requireStaff` |
| `POST` | `/api/clients` | `requireAuth + requireStaff` |
| `PUT` | `/api/clients/:id` | `requireAuth + requireStaff` |
| `DELETE` | `/api/clients/:id` | `requireAuth + requireStaff` |

## Appointments (`/api/appointments`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/appointments` | `requireAuth + requireStaff` |
| `POST` | `/api/appointments` | `requireAuth + requireStaff` |
| `PUT` | `/api/appointments/:id` | `requireAuth + requireStaff` |
| `DELETE` | `/api/appointments/:id` | `requireAuth + requireStaff` |

Enums relevantes:
- `status`: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`
- `paymentStatus`: `pending`, `paid`, `refunded`, `partial`
- `origin`: `manual`, `online`, `widget`

## Schedule Blocks (`/api/schedule-blocks`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/schedule-blocks` | `requireAuth + requireStaff` |
| `POST` | `/api/schedule-blocks` | `requireAuth + requireStaff` |
| `PUT` | `/api/schedule-blocks/:id` | `requireAuth + requireStaff` |
| `DELETE` | `/api/schedule-blocks/:id` | `requireAuth + requireStaff` |

## Service Categories (`/api/service-categories`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/service-categories` | `requireAuth + requireStaff` |
| `POST` | `/api/service-categories` | `requireAuth + requireStaff` |
| `PUT` | `/api/service-categories/:id` | `requireAuth + requireStaff` |
| `DELETE` | `/api/service-categories/:id` | `requireAuth + requireStaff` |

## Bonos (`/api/bonos`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/bonos/templates` | `requireAuth + requireStaff` |
| `POST` | `/api/bonos/templates` | `requireAuth + requireStaff` |
| `PUT` | `/api/bonos/templates/:id` | `requireAuth + requireStaff` |
| `DELETE` | `/api/bonos/templates/:id` | `requireAuth + requireStaff` |
| `GET` | `/api/bonos/client-bonos` | `requireAuth + requireStaff` |
| `POST` | `/api/bonos/client-bonos` | `requireAuth + requireStaff` |
| `PUT` | `/api/bonos/client-bonos/:id` | `requireAuth + requireStaff` |
| `DELETE` | `/api/bonos/client-bonos/:id` | `requireAuth + requireStaff` |

## Sales (`/api/sales`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/sales` | `requireAuth + requireStaff` |
| `GET` | `/api/sales/:id` | `requireAuth + requireStaff` |
| `POST` | `/api/sales` | `requireAuth + requireStaff` |
| `POST` | `/api/sales/:id/items` | `requireAuth + requireStaff` |
| `DELETE` | `/api/sales/:id/items/:itemId` | `requireAuth + requireStaff` |
| `POST` | `/api/sales/:id/pay` | `requireAuth + requireStaff` |
| `POST` | `/api/sales/:id/void` | `requireAuth + requireStaff` |

## Inventory (`/api/inventory`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/inventory?businessId=...` | No |
| `POST` | `/api/inventory` | No |
| `PUT` | `/api/inventory/:id` | No |
| `DELETE` | `/api/inventory/:id` | No |
| `POST` | `/api/inventory/:id/adjust` | No |
| `GET` | `/api/inventory/:id/movements` | No |
| `GET` | `/api/inventory/suppliers?businessId=...` | No |
| `POST` | `/api/inventory/suppliers` | No |

## Dashboard (`/api/dashboard`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/dashboard/stats` | `requireAuth + requireStaff` |

## Settings (`/api/settings`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/settings` | `requireAuth + requireStaff` |
| `PATCH` | `/api/settings` | `requireAuth + requireStaff` |

## Waitlist (`/api/waitlist`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/waitlist/by-business` | `requireAuth + requireStaff` |
| `POST` | `/api/waitlist/for-client` | `requireAuth + requireStaff` |
| `POST` | `/api/waitlist` | `requireAuth` |
| `GET` | `/api/waitlist` | `requireAuth` |
| `GET` | `/api/waitlist/notifications` | `requireAuth` |
| `PATCH` | `/api/waitlist/notifications/:id/read` | `requireAuth` |

## Reminders (`/api/reminders`)

| Método | Ruta | Auth |
|---|---|---|
| `POST` | `/api/reminders/send` | No (`x-cron-secret` opcional/recomendado) |

## Professions (`/api/professions`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/professions` | No |
| `GET` | `/api/professions/search?q=...` | No |
| `GET` | `/api/professions/:id` | No |
| `POST` | `/api/professions/discover` | No (rate-limited) |

## AI (`/api/ai`)

| Método | Ruta | Auth |
|---|---|---|
| `POST` | `/api/ai/parse-slot-query` | No |

Body esperado:

```json
{ "text": "lunes de 9 a 14" }
```

## Public (`/api/public`)

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/public/business/:slug` | No |
| `GET` | `/api/public/availability` | No |

## Códigos comunes

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Creado |
| `204` | Sin contenido |
| `400` | Request inválida |
| `401` | No autorizado |
| `403` | Acceso denegado |
| `404` | No encontrado |
| `409` | Conflicto |
| `500` | Error interno |

Formato de error habitual:

```json
{ "error": "Descripción" }
```

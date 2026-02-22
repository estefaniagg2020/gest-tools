# Módulos y funcionalidades

Resumen funcional del estado actual de la aplicación.

## Autenticación

- Rutas UI: `/login`, `/setup`, `/forgot-password`.
- API: `/api/auth/*`.
- Sesión mediante `sessionToken` (Bearer).

## Dashboard

- Ruta: `/`.
- KPIs y widgets configurables por negocio.
- API: `GET /api/dashboard/stats`.

## Agenda

- Ruta: `/scheduler`.
- Gestión de bloques y citas en vistas día/semana/mes.
- APIs: `/api/schedule-blocks`, `/api/appointments`, `/api/waitlist`.

## Equipo

- Ruta: `/team`.
- CRUD de miembros de equipo.
- API: `/api/employees`.

## Clientes

- Rutas: `/clients`, `/clients/:id`.
- Búsqueda inteligente y CRUD.
- API: `/api/clients`.

## Servicios y categorías

- Ruta: `/services`.
- Gestión de categorías y catálogo por negocio.
- APIs: `/api/service-categories`, `/api/businesses/:id/services`.

## Bonos

- Ruta: `/bonos`.
- Plantillas de bono y asignación a clientes.
- API: `/api/bonos/templates` y `/api/bonos/client-bonos`.

## Inventario

- Ruta: `/inventory`.
- Productos, proveedores y ajustes de stock.
- API: `/api/inventory`.

## Ventas

- Integrado en operación (tickets/checkout).
- API: `/api/sales`.

## Configuración

- Ruta hub: `/config`.
- Subrutas activas en router:
  - `/config/data`
  - `/config/themes`
  - `/config/grid`
  - `/config/dashboard`
  - `/config/agenda`
  - `/config/notifications`
  - `/config/icons`
  - `/config/language`
  - `/config/bonos`
  - `/config/billing`
  - `/config/modules`
- APIs: `/api/settings`, `/api/businesses/:id/config`.

## Reserva pública

- Ruta pública: `/b/:slug`.
- API pública: `/api/public/*`.

## Profesiones e IA

- Catálogo y búsqueda de profesiones: `/api/professions`.
- Descubrimiento asistido por IA: `POST /api/professions/discover`.
- Parsing de texto horario: `POST /api/ai/parse-slot-query`.

## Nota

Algunas capacidades están condicionadas por toggles de módulos (por ejemplo bonos/inventario). Ver `HIDDEN_FEATURES.md` para trazabilidad de features ocultas/deshabilitadas.

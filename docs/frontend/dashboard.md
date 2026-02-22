# Vista: Dashboard

**Ruta:** `/`

## Descripción

Pantalla de resumen operativo del negocio con KPIs y widgets configurables.

## Contenido principal

- Indicadores de agenda (ocupación, horas, bloques, equipo).
- Widgets de reservas, ingresos, cancelaciones, clientes nuevos y productividad.
- Widgets de waitlist, stock bajo y servicios populares (según módulos activos).
- Reordenación de widgets según configuración de layout/dashboard.

## Datos y dependencias

- `useDashboardAgendaStats`
- `useDashboardBookingStats`
- `useLayoutStore`
- `useScheduleStore`
- `useTeamStore`
- API backend: `GET /api/dashboard/stats`

## Notas

- La visibilidad de algunos widgets depende de configuración (`inventarioEnabled`, módulos activos).
- La fecha y textos se internacionalizan con `vue-i18n`.

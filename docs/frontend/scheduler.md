# Vista: Agenda (Scheduler)

**Ruta:** `/scheduler`

## Descripción

Gestión operativa de agenda con vistas día/semana/mes, bloques de horario, citas, waitlist y búsqueda de huecos.

## Contenido principal

- Header de navegación temporal y selector de vista.
- Vistas: `DayView`, `WeekView`, `WeekAgendaMobile`, `MonthView`.
- Gestión de bloques mediante `BlockEditorModal`.
- Gestión de citas mediante `AppointmentEditorModal`.
- Panel derecho con `WaitlistPanel` y `SlotFinderCard`.

## Persistencia y datos

- Bloques: API `GET/POST/PUT/DELETE /api/schedule-blocks`.
- Citas: API `GET/POST/PUT/DELETE /api/appointments`.
- Waitlist: API `/api/waitlist/*`.
- Preferencias visuales: `schedulerSettings` y `gestorConfig`.
- Soporte de almacenamiento local para parte de UX (p. ej. notificaciones rechazadas), sin sustituir persistencia principal en backend.

## Roles

- `manager`/staff: acceso completo de gestión.
- `employee`: acceso restringido según lógica de rol de la app.

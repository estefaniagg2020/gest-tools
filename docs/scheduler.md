# Vista: Agenda (Scheduler)

**Ruta:** `/scheduler`

## Descripción

Gestión de la agenda semanal: bloques por terapeuta (turnos, vacaciones, formación, etc.), vista día/semana/mes, y flujo de aprobación de cambios para el manager.

## Contenido

- **Cabecera:** Título "Agenda de [nombre terapeuta]" o "Mi Horario", año, navegación (Hoy, anterior/siguiente, vista Día/Semana/Mes) y botón para mostrar/ocultar el panel derecho.
- **Banner de cambios pendientes (solo Manager):** Si hay bloques con estado "pendiente", se muestra un aviso con número y botón "Revisar". Al pulsar se abre un modal con la lista de bloques pendientes; cada uno se puede **Aprobar** (pasa a confirmado) o **Rechazar** (se elimina el bloque y se notifica al empleado).
- **Vista Semana (escritorio):** Grid con días en columnas y franjas horarias; bloques posicionados por hora. Clic en una franja abre el modal para crear bloque; clic en un bloque para editar/eliminar.
- **Vista Semana (móvil):** Lista vertical por día tipo "Today's task": cada día con sus bloques como tarjetas (título, descripción, hora, duración, terapeuta). Clic en tarjeta abre el editor.
- **Vista Día:** Un día con columnas por terapeuta y bloques por franja.
- **Vista Mes:** Calendario mensual con bloques por día.
- **Panel derecho (escritorio, se puede ocultar):** Configuración de vista (hora inicio/fin, duración de franja, altura), selector de Spa, lista de equipo (terapeutas) para elegir agenda, y acciones rápidas (generar datos de prueba, hint para añadir).
- **Botón flotante "+":** Abre el modal para crear un nuevo bloque.

## Roles

- **Manager:** Ve el banner de pendientes, puede aprobar/rechazar. Puede ver la agenda de cualquier terapeuta del spa seleccionado.
- **Empleado:** Ve "Mi Horario" (su propia agenda). Si el manager ha rechazado alguna de sus peticiones, al entrar en la agenda se muestra un modal con el detalle de la petición cancelada.

## Contraseña demo

No se usa contraseña en esta vista. El cambio de rol (y por tanto qué agenda se ve) se hace desde la barra lateral con contraseña **`demo`**.

## Persistencia

- Bloques de agenda: `localStorage` (clave `spa-schedule-blocks`).
- Peticiones rechazadas (para el aviso al empleado): `localStorage` (clave `spa-rejected-requests`).
- Configuración de vista (horas, etc.): según `schedulerSettingsStorage`.

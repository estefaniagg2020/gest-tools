# Vista: Equipo

**Ruta actual:** `/team`

## Descripción

Gestión de miembros del equipo (antes documentado como "terapeutas").

## Contenido

- Listado responsive (tarjetas y avatares).
- Búsqueda, paginación y ordenación.
- Alta/edición/borrado en modal (`TeamEditorModal`).
- Limpieza masiva del equipo (acción de gestión).

## Datos y persistencia

- Composable: `useTeamManager`.
- Store principal: `team`.
- API backend: `/api/employees`.

## Nota de nomenclatura

Este documento mantiene el nombre histórico `therapists.md` por compatibilidad, pero la funcionalidad vigente se expone como módulo **Equipo**.

# Vista: Equipo

**Ruta actual:** `/team`

## Descripción

Gestión de miembros del equipo (antes documentado como "terapeutas").

## Contenido

- Listado responsive (tarjetas y avatares).
- Búsqueda, paginación y ordenación.
- Alta/edición/borrado en modal (`TeamEditorModal`) para perfiles con permisos de administración.
- Limpieza masiva del equipo (acción de gestión) para perfiles con permisos de administración.

## Datos y persistencia

- Composable: `useTeamManager`.
- Store principal: `team`.
- API backend: `/api/employees`.

## Permisos

- `admin` y `superadmin`: pueden crear, editar y eliminar miembros.
- `employee`: acceso de solo lectura al listado (sin acciones de gestión en UI).

## Nota de nomenclatura

Este documento mantiene el nombre histórico `therapists.md` por compatibilidad, pero la funcionalidad vigente se expone como módulo **Equipo**.

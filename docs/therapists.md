# Vista: Equipo (Terapeutas)

**Ruta:** `/therapists`

## Descripción

CRUD de terapeutas/empleados del equipo: listado en tarjetas (escritorio) o en cuadrícula de avatares (móvil), crear, editar y eliminar.

## Contenido

- **Cabecera:** Título "Terapeutas" (o similar), subtítulo y botón "Nuevo Terapeuta".
- **Listado:**
  - **Escritorio:** Tarjetas con foto, nombre, email, teléfono, spa asignado, horas semanales, enlaces a editar y eliminar.
  - **Móvil:** Cuadrícula de avatares (TherapistAvatarTile) con nombre; clic para editar o eliminar.
- **Modal de edición/creación:** Formulario con nombre, email, teléfono, spa, horas semanales, URL foto, LinkedIn, hora inicio/fin por defecto. Botones Cancelar y Guardar/Crear.

## Roles

Acceso típico para manager. La visibilidad por ruta no está restringida en la demo; el rol solo afecta a la agenda y al cambio de usuario en la barra lateral.

## Persistencia

Terapeutas en `localStorage` (clave definida en `therapistStore`). No se usa contraseña en esta vista.

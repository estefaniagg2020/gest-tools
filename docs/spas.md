# Vista: Centros Spa

**Ruta:** `/spas`

## Descripción

Gestión de centros/spas: listado de sucursales con información resumida (terapeutas asignados, servicios), crear, editar y eliminar. Incluye gestión de servicios asociados a cada spa.

## Contenido

- **Cabecera:** Título "Gestión de Spas", descripción y botón "Añadir Spa".
- **Listado de spas:** Cada spa se muestra en una tarjeta con nombre, ID, número de terapeutas, número de servicios, y acciones (editar, eliminar). Posible expansión o modal para ver/editar servicios del spa.
- **Modales / formularios:** Crear y editar spa (nombre, tema/color, etc.); gestión de servicios vinculados al spa.

## Roles

Pensada para perfil manager/administrador. En la demo no hay restricción por rol en la ruta.

## Persistencia

Datos de spas (y servicios si aplica) en `localStorage` (adapters en `infrastructure/` y stores). No se usa contraseña en esta vista.

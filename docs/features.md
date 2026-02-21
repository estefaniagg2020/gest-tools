# Módulos y funcionalidades

Descripción detallada de cada módulo del sistema.

---

## Autenticación y roles

**Ruta:** `/login`, `/setup`, `/forgot-password`  
**Store:** `auth.ts`  
**API:** `/api/auth`

### Flujo de acceso

1. **Setup inicial** (`/setup`): Si no hay usuarios en la BD, la app redirige aquí para crear el primer usuario superadmin.
2. **Login** (`/login`): Autenticación con usuario y contraseña. Devuelve un `sessionToken` que se guarda en `localStorage` via `authStorage.ts`.
3. **Forgot password** (`/forgot-password`): Reseteo de contraseña sin email (solo por username). Útil en entornos sin SMTP configurado.

### Roles

| Rol | Descripción | Permisos |
|---|---|---|
| `superadmin` | Propietario del sistema | Acceso total |
| `admin` | Administrador del negocio | Gestión completa del negocio |
| `employee` | Empleado | Acceso a agenda y citas propias |
| `client` | Cliente | Solo reserva online (widget público) |

---

## Dashboard

**Ruta:** `/`  
**Vista:** `DashboardView.vue`  
**Composable:** `useDashboard.ts`  
**API:** `/api/dashboard`

Panel principal con métricas y widgets configurables del negocio:

- **Citas de hoy**: número y detalle de las próximas citas.
- **Reservas del mes/semana**: volumen de reservas.
- **Ingresos mensuales**: facturación del mes.
- **Clientes nuevos**: altas recientes.
- **Ocupación semanal**: porcentaje de horas ocupadas.
- **Tasa de cancelación**: ratio de citas canceladas.
- **Beneficio diario**: ingresos del día.
- **Empleado con más reservas**: ranking del equipo.
- **Servicios populares**: los más solicitados.
- **Lista de espera**: entradas activas.
- **Stock bajo**: productos por debajo del mínimo.
- **Ventas por empleado**: desglose de facturación.

Los widgets visibles en el dashboard son configurables desde `/config/dashboard`.

---

## Agenda (Scheduler)

**Ruta:** `/scheduler`  
**Vista:** `SchedulerView.vue`  
**Composable:** `useScheduleBlocks.ts`, `useCalendar.ts`  
**API:** `/api/schedule-blocks`, `/api/appointments`

### Vistas de la agenda

| Vista | Descripción |
|---|---|
| **Día** | Columnas por miembro del equipo, franjas por hora |
| **Semana** | Grid semanal con bloques posicionados |
| **Mes** | Calendario mensual con vista compacta |
| **Semana móvil** | Lista vertical tipo "Today's tasks" |

### Bloques de horario

Tipos de bloque: trabajo, descanso, vacaciones, formación, otros.

**Estados de bloque:** `active`, `cancelled`

### Flujo de aprobación (manager/empleado)

1. El empleado crea un bloque → queda en estado `pending`.
2. El manager ve el **banner de cambios pendientes** → puede **Aprobar** (→ `active`) o **Rechazar** (→ eliminar + notificación al empleado).
3. Al volver a la agenda, el empleado ve un modal con el detalle del rechazo.

### Roles en la agenda

- **Admin/Manager**: ve la agenda de cualquier miembro del equipo. Puede crear, editar y aprobar bloques.
- **Employee**: ve solo su propia agenda. Puede crear bloques (quedan pendientes de aprobación).

---

## Equipo

**Ruta:** `/team`  
**Vista:** `TeamManagerView.vue`  
**Composable:** `useTeamManager.ts`  
**API:** `/api/employees`

Gestión de los miembros del equipo del negocio:

- CRUD de miembros (nombre, foto, teléfono, email, color de agenda).
- Asignación de rol (`admin`, `employee`).
- Configuración de horario habitual (días y horas de trabajo).
- Vinculación con usuario del sistema (`User`) para acceso con login propio.

---

## Clientes

**Ruta:** `/clients`, `/clients/:id`  
**Vistas:** `ClientsView.vue`, `ClientDetailView.vue`  
**Composable:** `useClientsManager.ts`  
**API:** `/api/clients`

- Listado y búsqueda de clientes del negocio.
- Ficha de cliente: datos, historial de citas, bonos activos, fotos.
- Gestión de fotos del cliente (galería antes/después).
- Notas internas.
- Historial de bonos y sesiones consumidas.

---

## Servicios

**Ruta:** `/services`  
**Vista:** `ServicesView.vue`  
**Composable:** `useServicesManager.ts`  
**API:** `/api/service-categories`

- Catálogo de servicios organizado por categorías.
- CRUD de categorías (label, icono, orden).
- CRUD de servicios (nombre, duración, precio, descripción).
- Activar/desactivar disponibilidad para reserva online.
- Configurar depósito requerido por servicio.
- **Plantillas por profesión** (IA): al configurar la profesión del negocio, se sugieren automáticamente categorías y servicios predefinidos que pueden importarse con un clic.

---

## Bonos (Vouchers/Packs)

**Ruta:** `/bonos`  
**Vista:** `BonosView.vue`  
**Composable:** `useBonosManager.ts`  
**API:** `/api/bonos`

### Tipos de bono

| Tipo | Descripción |
|---|---|
| `session_pack` | Pack de N sesiones de un servicio |
| `time_pack` | Pack de X minutos totales |
| `unlimited` | Uso ilimitado durante un periodo |
| `loyalty` | Fidelización (acumulación de puntos/sellos) |

### Gestión

- Crear bonos con nombre, tipo, sesiones/minutos, precio y caducidad.
- Asignar bonos a clientes desde la ficha del cliente o desde la vista de bonos.
- Registrar uso de sesión al cobrar una cita.
- Ver bonos activos, caducados y consumidos del cliente.

---

## Inventario

**Ruta:** `/inventory`  
**Vista:** `InventoryView.vue`  
**Composable:** `useInventoryManager.ts`  
**API:** `/api/inventory`

- **Productos**: CRUD con SKU, código de barras, precio de venta, coste y stock actual.
- **Proveedores**: CRUD de proveedores con datos de contacto.
- **Movimientos de stock**: trazabilidad de cada cambio de stock (ajuste, venta, compra, uso, devolución).
- **Alertas de stock mínimo**: productos por debajo del umbral configurado.
- Los movimientos de stock se generan automáticamente al registrar una venta con productos.

---

## Ventas (TPV)

**Ruta:** integrado en la gestión de citas y como módulo independiente  
**API:** `/api/sales`

### Flujo de venta

1. Se crea un ticket en estado `open` (puede ser a partir de una cita o desde cero).
2. Se añaden líneas: servicios y/o productos.
3. Se cobra (`pay`) → pasa a `paid` con el método de pago elegido.
4. Opcionalmente se puede reembolsar → `refunded`.

### Métodos de pago

`cash`, `card`, `transfer`, `bono`, `mixed`

### El ticket incluye

- Subtotal, descuentos, impuestos (IVA configurable) y total.
- Líneas con precio unitario, cantidad y descuento por línea.
- Asociación con cliente y/o cita.

---

## Citas

**Ruta:** `/scheduler` (gestión principal)  
**API:** `/api/appointments`

- Creación manual de citas desde la agenda (clic en franja libre).
- Creación desde la ficha del cliente.
- Estados: `pending` → `confirmed` → `completed` / `cancelled` / `no_show`.
- Pago parcial (depósito) o total al crear la cita.
- Carrito de ítems por cita (`cartItems`).
- Origen: `manual`, `online` (widget de reserva), `widget`.

---

## Reserva online

**Ruta pública:** `/b/:slug`  
**API pública:** `/api/public`

Widget de reserva sin necesidad de login:

1. El cliente accede a la URL pública del negocio.
2. Elige servicio, fecha y hora disponible.
3. Introduce sus datos (nombre, teléfono, email).
4. La reserva queda registrada como `Appointment` con origen `online`.
5. Si el negocio tiene depósito configurado, se gestiona el pago del depósito.

**Configuración:** activar desde `/config/booking` (habilitar reserva online, configurar depósito, personalizar slug).

---

## Lista de espera

**API:** `/api/waitlist`

- Los clientes pueden apuntarse a la lista de espera para un servicio si no hay disponibilidad.
- Cuando se libera un hueco (cancelación de cita), el sistema genera una `WaitlistNotification`.
- El negocio puede notificar al cliente (por WhatsApp si está configurado).

---

## Configuración del negocio

**Ruta:** `/config/*`  
**Vista:** `ConfigHubView.vue` y sub-vistas  
**Store:** `gestorConfig.ts`  
**API:** `/api/settings`

El hub de configuración agrupa todos los ajustes del negocio en una tabla `GestorConfig`:

| Sección | Ruta | Descripción |
|---|---|---|
| **Datos del negocio** | `/config/business` | Nombre, logo, CIF, dirección, teléfono |
| **Profesión** | `/config/profession` | Actividad principal (peluquería, estética, etc.) |
| **Tema** | `/config/theme` | Tema visual, modo claro/oscuro, colores |
| **Agenda** | `/config/agenda` | Horario, duración de franja, vista por defecto |
| **Colores de agenda** | `/config/agenda-colors` | Colores por empleado o globales |
| **Layout** | `/config/layout` | Posición del sidebar, módulos visibles |
| **Dashboard** | `/config/dashboard` | Widgets visibles en el dashboard |
| **Módulos** | `/config/modules` | Habilitar/deshabilitar bonos, servicios, inventario |
| **Notificaciones** | `/config/notifications` | WhatsApp (recordatorios) |
| **Facturación** | `/config/billing` | IVA por defecto, carrito |
| **Reserva online** | `/config/booking` | Activar widget, depósito, slug, redes sociales |
| **Idioma** | `/config/locale` | Idioma de la interfaz |

---

## Notificaciones WhatsApp

**API:** `/api/reminders`  
**Servicio:** `server/src/services/whatsapp.ts`

- Envío de recordatorios de cita por WhatsApp.
- Requiere configurar `whatsappPhoneNumberId` en la configuración del negocio.
- Se envían automáticamente según la antelación configurada.

---

## IA — Detección de profesión y parsing de horarios

**API:** `/api/ai`  
**Servicios:** `aiProfessionDiscovery.ts`, `aiSlotParser.ts`

### Detección de profesión (`POST /api/ai/detect-profession`)
A partir de texto libre (ej. "Soy peluquera canina"), detecta la profesión más cercana de las plantillas del sistema.

### Parsing de franjas horarias (`POST /api/ai/parse-slots`)
Convierte texto natural (ej. "lunes y miércoles de 9 a 14h") en franjas estructuradas de horario.

Estas capacidades alimentan el **onboarding guiado** del negocio.

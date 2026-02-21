# Referencia de la API REST

URL base: `http://localhost:3000`

## Autenticación

La mayoría de endpoints requieren un **Bearer token** en la cabecera:

```
Authorization: Bearer <sessionToken>
```

El token se obtiene al hacer login (`POST /api/auth/login`) y se invalida al hacer logout o cambiar contraseña.

### Niveles de acceso

| Middleware | Roles permitidos |
|---|---|
| `requireAuth` | Cualquier usuario autenticado |
| `requireStaff` | `superadmin`, `admin`, `employee` |
| `requireAdmin` | `superadmin`, `admin` |
| `requireSuperadmin` | `superadmin` |

---

## Health check

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servidor |

**Respuesta:**
```json
{ "status": "ok", "timestamp": "2026-02-20T10:00:00.000Z" }
```

---

## Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/auth/setup-status` | No | Comprueba si hay usuarios registrados |
| `POST` | `/api/auth/register` | No | Registro del primer usuario (superadmin) |
| `POST` | `/api/auth/login` | No | Login con usuario y contraseña |
| `POST` | `/api/auth/logout` | `requireAuth` | Invalida el token de sesión |
| `POST` | `/api/auth/forgot-password` | No | Reseteo de contraseña por username |
| `POST` | `/api/auth/change-password` | `requireAuth` | Cambio de contraseña (con contraseña actual) |
| `PATCH` | `/api/auth/me` | `requireAuth` | Actualizar perfil (nombre, teléfono) |

### POST /api/auth/login
```json
// Body
{ "username": "admin", "password": "1234" }

// Respuesta 200
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "superadmin",
    "name": null,
    "email": null,
    "phone": null,
    "businessId": "uuid"
  },
  "token": "session-token-string"
}
```

### POST /api/auth/register
Solo funciona si no hay ningún usuario en la BD. Crea superadmin + company + business.
```json
// Body
{ "username": "admin", "password": "1234" }
```

---

## Empresas — `/api/companies`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/companies` | `requireAuth` | Listar empresas |
| `POST` | `/api/companies` | `requireAuth` | Crear empresa |
| `GET` | `/api/companies/:id` | `requireAuth` | Obtener empresa por ID |
| `PATCH` | `/api/companies/:id` | `requireAuth` | Actualizar empresa |
| `DELETE` | `/api/companies/:id` | `requireAuth` | Eliminar empresa |

---

## Negocios — `/api/businesses`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/businesses` | `requireAuth` | Listar negocios del usuario |
| `POST` | `/api/businesses` | `requireAuth` | Crear negocio |
| `GET` | `/api/businesses/:id` | `requireAuth` | Obtener negocio por ID |
| `PATCH` | `/api/businesses/:id` | `requireAuth` | Actualizar negocio |
| `DELETE` | `/api/businesses/:id` | `requireAuth` | Eliminar negocio |

---

## Miembros del equipo — `/api/employees`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/employees` | `requireStaff` | Listar miembros del negocio |
| `POST` | `/api/employees` | `requireStaff` | Crear miembro |
| `GET` | `/api/employees/:id` | `requireStaff` | Obtener miembro por ID |
| `PATCH` | `/api/employees/:id` | `requireStaff` | Actualizar miembro |
| `DELETE` | `/api/employees/:id` | `requireAdmin` | Eliminar miembro |

---

## Clientes — `/api/clients`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/clients` | `requireStaff` | Listar clientes del negocio |
| `POST` | `/api/clients` | `requireStaff` | Crear cliente |
| `GET` | `/api/clients/:id` | `requireStaff` | Obtener cliente por ID |
| `PATCH` | `/api/clients/:id` | `requireStaff` | Actualizar cliente |
| `DELETE` | `/api/clients/:id` | `requireStaff` | Eliminar cliente |
| `GET` | `/api/clients/:id/photos` | `requireStaff` | Fotos del cliente |
| `POST` | `/api/clients/:id/photos` | `requireStaff` | Añadir foto al cliente |
| `DELETE` | `/api/clients/:id/photos/:photoId` | `requireStaff` | Eliminar foto |

---

## Citas — `/api/appointments`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/appointments` | `requireStaff` | Listar citas del negocio |
| `POST` | `/api/appointments` | `requireStaff` | Crear cita |
| `GET` | `/api/appointments/:id` | `requireStaff` | Obtener cita por ID |
| `PATCH` | `/api/appointments/:id` | `requireStaff` | Actualizar cita |
| `DELETE` | `/api/appointments/:id` | `requireStaff` | Eliminar cita |

**Estados de cita:** `pending`, `confirmed`, `cancelled`, `completed`, `no_show`  
**Estados de pago:** `pending`, `paid`, `refunded`, `partial`  
**Origen:** `manual`, `online`, `widget`

---

## Reservas — `/api/bookings`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/bookings` | `requireStaff` | Listar reservas |
| `POST` | `/api/bookings` | `requireStaff` | Crear reserva |
| `GET` | `/api/bookings/:id` | `requireStaff` | Obtener reserva |
| `PATCH` | `/api/bookings/:id` | `requireStaff` | Actualizar reserva |
| `DELETE` | `/api/bookings/:id` | `requireStaff` | Cancelar reserva |

---

## Bloques de horario — `/api/schedule-blocks`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/schedule-blocks` | `requireStaff` | Listar bloques del negocio |
| `POST` | `/api/schedule-blocks` | `requireStaff` | Crear bloque |
| `PATCH` | `/api/schedule-blocks/:id` | `requireStaff` | Actualizar bloque |
| `DELETE` | `/api/schedule-blocks/:id` | `requireStaff` | Eliminar bloque |

**Estados:** `active`, `cancelled`

---

## Bonos — `/api/bonos`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/bonos` | `requireStaff` | Listar bonos del negocio |
| `POST` | `/api/bonos` | `requireStaff` | Crear bono |
| `GET` | `/api/bonos/:id` | `requireStaff` | Obtener bono |
| `PATCH` | `/api/bonos/:id` | `requireStaff` | Actualizar bono |
| `DELETE` | `/api/bonos/:id` | `requireStaff` | Eliminar bono |
| `GET` | `/api/bonos/client/:clientId` | `requireStaff` | Bonos de un cliente |
| `POST` | `/api/bonos/assign` | `requireStaff` | Asignar bono a cliente |
| `PATCH` | `/api/bonos/client/:clientBonoId/use` | `requireStaff` | Registrar uso de sesión |

**Tipos de bono:** `session_pack`, `time_pack`, `unlimited`, `loyalty`

---

## Ventas — `/api/sales`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/sales` | `requireStaff` | Listar ventas del negocio |
| `POST` | `/api/sales` | `requireStaff` | Crear venta (ticket abierto) |
| `GET` | `/api/sales/:id` | `requireStaff` | Obtener venta con líneas |
| `PATCH` | `/api/sales/:id` | `requireStaff` | Actualizar venta |
| `POST` | `/api/sales/:id/pay` | `requireStaff` | Cobrar venta |
| `POST` | `/api/sales/:id/refund` | `requireStaff` | Reembolsar venta |
| `POST` | `/api/sales/:id/items` | `requireStaff` | Añadir línea a venta |
| `DELETE` | `/api/sales/:id/items/:itemId` | `requireStaff` | Eliminar línea |

**Estados de venta:** `open`, `paid`, `refunded`, `voided`  
**Métodos de pago:** `cash`, `card`, `transfer`, `bono`, `mixed`  
**Tipo de línea:** `service`, `product`

---

## Inventario — `/api/inventory`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/inventory/products` | `requireStaff` | Listar productos |
| `POST` | `/api/inventory/products` | `requireStaff` | Crear producto |
| `GET` | `/api/inventory/products/:id` | `requireStaff` | Obtener producto |
| `PATCH` | `/api/inventory/products/:id` | `requireStaff` | Actualizar producto |
| `DELETE` | `/api/inventory/products/:id` | `requireStaff` | Eliminar producto |
| `GET` | `/api/inventory/suppliers` | `requireStaff` | Listar proveedores |
| `POST` | `/api/inventory/suppliers` | `requireStaff` | Crear proveedor |
| `PATCH` | `/api/inventory/suppliers/:id` | `requireStaff` | Actualizar proveedor |
| `DELETE` | `/api/inventory/suppliers/:id` | `requireStaff` | Eliminar proveedor |
| `GET` | `/api/inventory/movements` | `requireStaff` | Listar movimientos de stock |
| `POST` | `/api/inventory/movements` | `requireStaff` | Registrar movimiento |

**Tipos de movimiento:** `ADJUSTMENT`, `SALE`, `PURCHASE`, `USAGE`, `RETURN`

---

## Categorías de servicios — `/api/service-categories`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/service-categories` | `requireStaff` | Listar categorías |
| `POST` | `/api/service-categories` | `requireStaff` | Crear categoría |
| `PATCH` | `/api/service-categories/:id` | `requireStaff` | Actualizar categoría |
| `DELETE` | `/api/service-categories/:id` | `requireStaff` | Eliminar categoría |
| `GET` | `/api/service-categories/:id/services` | `requireStaff` | Servicios de una categoría |
| `POST` | `/api/service-categories/:id/services` | `requireStaff` | Crear servicio en categoría |
| `PATCH` | `/api/service-categories/services/:id` | `requireStaff` | Actualizar servicio |
| `DELETE` | `/api/service-categories/services/:id` | `requireStaff` | Eliminar servicio |

---

## Configuración — `/api/settings`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/settings` | `requireAuth` | Obtener configuración del negocio (`GestorConfig`) |
| `PATCH` | `/api/settings` | `requireAdmin` | Actualizar configuración |

---

## Dashboard — `/api/dashboard`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/dashboard` | `requireStaff` | Métricas del negocio |
| `GET` | `/api/dashboard/today` | `requireStaff` | Citas de hoy |
| `GET` | `/api/dashboard/weekly` | `requireStaff` | Reservas de la semana |
| `GET` | `/api/dashboard/monthly` | `requireStaff` | Datos del mes |

---

## Lista de espera — `/api/waitlist`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/waitlist` | `requireStaff` | Listar entradas de waitlist |
| `POST` | `/api/waitlist` | `requireStaff` | Añadir a la lista de espera |
| `DELETE` | `/api/waitlist/:id` | `requireStaff` | Eliminar entrada |
| `GET` | `/api/waitlist/notifications` | `requireStaff` | Notificaciones de waitlist |

---

## Recordatorios — `/api/reminders`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/reminders/whatsapp` | `requireStaff` | Enviar recordatorio por WhatsApp |

---

## Profesiones — `/api/professions`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/professions` | `requireAuth` | Listar plantillas de profesión |
| `GET` | `/api/professions/:id` | `requireAuth` | Obtener profesión con categorías y servicios |

---

## IA — `/api/ai`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/ai/detect-profession` | No | Detectar profesión a partir de texto |
| `POST` | `/api/ai/parse-slots` | No | Parsear franjas horarias desde texto natural |

---

## Endpoints públicos — `/api/public`

> Sin autenticación. Para el widget de reserva online.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/public/business/:slug` | Info pública del negocio |
| `GET` | `/api/public/business/:slug/services` | Servicios disponibles para reserva |
| `GET` | `/api/public/business/:slug/availability` | Disponibilidad de franjas |
| `POST` | `/api/public/business/:slug/book` | Crear reserva online |

---

## Códigos de respuesta comunes

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Creado |
| `400` | Bad Request (falta algún campo requerido) |
| `401` | No autorizado (token inválido o ausente) |
| `403` | Prohibido (rol insuficiente o negocio no asociado) |
| `404` | No encontrado |
| `500` | Error interno del servidor |

## Formato de error

```json
{ "error": "Descripción del error" }
```

# Base de datos

**Motor:** PostgreSQL 15  
**ORM:** Prisma 7 con `@prisma/adapter-pg`  
**Schema:** `server/prisma/schema.prisma`

---

## Diagrama de relaciones

```
Company (1) ──────────────────────────── (N) Business
                                               │
          ┌────────────────────────────────────┤
          │                                    │
          ▼                                    ▼
    GestorConfig (1:1)               WorkspaceMember (N)
                                          │
                                     User (FK roleId)
                                          │
                                       Role

Business (1) ──────── (N) ServiceCategory ──── (N) Service
Business (1) ──────── (N) Appointment ──────── WorkspaceMember, Service, Client
Business (1) ──────── (N) ScheduleBlock ────── WorkspaceMember
Business (1) ──────── (N) Client ───────────── (N) ClientPhoto, ClientBono
Business (1) ──────── (N) Bono ─────────────── (N) ClientBono
Business (1) ──────── (N) Product ──────────── (N) StockMovement
Business (1) ──────── (N) Supplier
Business (1) ──────── (N) Sale ─────────────── (N) SaleItem
Business (1) ──────── (N) SlotWaitlistEntry
Business (N) ──────── (1) Profession ────────── ProfessionCategory, ProfessionService
```

---

## Modelos

### `Company`
Empresa madre (grupo). Un Company tiene N Business.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre de la empresa |
| `createdAt` | `DateTime` | Fecha de creación |
| `updatedAt` | `DateTime` | Fecha de actualización |

---

### `Business`
Cada negocio/centro individual.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre del negocio |
| `logoUrl` | `String?` | URL del logotipo |
| `email` | `String?` | Email del negocio |
| `phone` | `String?` | Teléfono |
| `address` | `String?` | Dirección |
| `professionId` | `String?` | FK → `Profession` (actividad principal) |
| `taxId` | `String?` | NIF/CIF |
| `businessAddress` | `String?` | Dirección fiscal |
| `businessPopulation` | `String?` | Localidad |
| `isCanarias` | `Boolean` | Régimen canario (IVA) |
| `description` | `String?` | Descripción pública |
| `publicPhoneNumber` | `String?` | Teléfono público (booking online) |
| `slug` | `String?` (unique) | Slug para URL pública (`/b/:slug`) |
| `socialLinks` | `Json?` | Redes sociales |
| `companyId` | `String` | FK → `Company` |

---

### `GestorConfig`
Tabla central de configuración. Una por Business (relación 1:1).

| Sección | Campos |
|---|---|
| **Idioma** | `locale` |
| **Profesión** | `professionId` |
| **Temas** | `themeId`, `colorMode`, `customColors` |
| **Agenda** | `startHour`, `endHour`, `pixelsPerHour`, `slotDurationMinutes`, `workDaysPerWeek`, `maxPeoplePerSlot`, `defaultView`, `weekStart` |
| **Colores de agenda** | `sameColorsForAll`, `agendaBg`, `markedDaysColor`, `vacationColor`, `perAgendaColors` |
| **Layout** | `sidebarPosition` (`left`/`right`/`none`), `showNavbar`, `calendarAppearance`, `sidebarModuleIds` |
| **Dashboard** | `dashboardModuleIds` |
| **Iconos** | `moduleIcons` |
| **Títulos** | `titleTextOverrides` |
| **WhatsApp** | `whatsappRemindersEnabled`, `whatsappPhoneNumberId` |
| **Facturación** | `defaultVatPercent`, `cartEnabled` |
| **Módulos** | `bonosEnabled`, `serviciosEnabled`, `inventarioEnabled` |
| **Smart filling** | `smartFillingEnabled`, `smartFillingDiscountPercent` |
| **Reserva online** | `bookingEnabled`, `depositPercent`, `depositRequired`, `slug`, `socialLinks` |
| **Onboarding** | `onboardingComplete` |
| **Agendas** | `agendaListConfig` |

---

### `Role`
Roles del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` (unique) | Nombre: `superadmin`, `admin`, `employee`, `client` |
| `description` | `String?` | Descripción del rol |

---

### `User`
Usuarios del sistema (credenciales de acceso).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `username` | `String` (unique) | Nombre de usuario (lowercase) |
| `passwordHash` | `String` | Hash de contraseña |
| `salt` | `String` | Salt para el hash |
| `sessionToken` | `String?` | Token de sesión activa |
| `name` | `String?` | Nombre visible |
| `email` | `String?` | Email |
| `phone` | `String?` | Teléfono |
| `roleId` | `String` | FK → `Role` |

---

### `WorkspaceMember`
Miembros del equipo vinculados a un negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre visible |
| `phone` | `String?` | Teléfono |
| `email` | `String?` | Email |
| `photoUrl` | `String?` | Foto de perfil |
| `color` | `String?` | Color en la agenda |
| `scheduleStart` | `String?` | Hora de inicio de jornada |
| `scheduleEnd` | `String?` | Hora de fin de jornada |
| `workDays` | `Int[]` | Días laborables (0=Dom, 1=Lun…) |
| `roleId` | `String` | FK → `Role` |
| `userId` | `String?` | FK → `User` (opcional) |
| `businessId` | `String` | FK → `Business` |

---

### `ServiceCategory`
Categorías de servicios del negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `label` | `String` | Nombre de la categoría |
| `icon` | `String?` | Icono |
| `order` | `Int` | Orden de visualización |
| `businessId` | `String` | FK → `Business` |

---

### `Service`
Servicios ofrecidos por el negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre del servicio |
| `duration` | `Int` | Duración en minutos |
| `price` | `Float` | Precio |
| `description` | `String?` | Descripción |
| `categoryId` | `String?` | FK → `ServiceCategory` |
| `businessId` | `String` | FK → `Business` |
| `bookingEnabled` | `Boolean` | Disponible en reserva online |
| `depositRequired` | `Boolean` | Requiere depósito |
| `depositAmount` | `Float?` | Importe del depósito |

---

### `Appointment`
Citas del negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `start` | `DateTime` | Inicio de la cita |
| `end` | `DateTime` | Fin de la cita |
| `status` | `AppointmentStatus` | Estado de la cita |
| `paymentStatus` | `PaymentStatus` | Estado del pago |
| `origin` | `AppointmentOrigin` | Origen: `manual`, `online`, `widget` |
| `notes` | `String?` | Notas internas |
| `clientNotes` | `String?` | Notas del cliente |
| `cartItems` | `Json?` | Ítems del carrito |
| `workspaceMemberId` | `String?` | FK → `WorkspaceMember` |
| `serviceId` | `String?` | FK → `Service` |
| `clientId` | `String?` | FK → `Client` |
| `businessId` | `String` | FK → `Business` |
| `depositPaid` | `Float?` | Depósito pagado |

---

### `ScheduleBlock`
Bloques en la agenda (turnos, vacaciones, formación…).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `type` | `String` | Tipo de bloque (work, vacation, training…) |
| `startDate` | `DateTime` | Inicio |
| `endDate` | `DateTime` | Fin |
| `status` | `BlockStatus` | `active`, `cancelled` |
| `notes` | `String?` | Notas |
| `workspaceMemberId` | `String` | FK → `WorkspaceMember` |
| `businessId` | `String` | FK → `Business` |

---

### `Client`
Clientes del negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre |
| `email` | `String?` | Email |
| `phone` | `String?` | Teléfono |
| `notes` | `String?` | Notas internas |
| `businessId` | `String` | FK → `Business` |

---

### `Bono`
Tipos de bono/pack del negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre del bono |
| `type` | `BonoType` | `session_pack`, `time_pack`, `unlimited`, `loyalty` |
| `sessions` | `Int?` | Número de sesiones (session_pack) |
| `minutes` | `Int?` | Minutos (time_pack) |
| `price` | `Float` | Precio del bono |
| `validityDays` | `Int?` | Días de validez |
| `businessId` | `String` | FK → `Business` |

---

### `ClientBono`
Asociación cliente–bono (muchos a muchos).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `sessionsUsed` | `Int` | Sesiones consumidas |
| `sessionsRemaining` | `Int?` | Sesiones restantes |
| `expiresAt` | `DateTime?` | Fecha de caducidad |
| `clientId` | `String` | FK → `Client` |
| `bonoId` | `String` | FK → `Bono` |

---

### `Product`
Productos del inventario.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre |
| `sku` | `String?` | SKU |
| `barcode` | `String?` | Código de barras |
| `price` | `Float` | Precio de venta |
| `cost` | `Float?` | Coste |
| `stock` | `Int` | Stock actual |
| `minStock` | `Int` | Stock mínimo (alerta) |
| `supplierId` | `String?` | FK → `Supplier` |
| `businessId` | `String` | FK → `Business` |

---

### `Supplier`
Proveedores.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` | Nombre |
| `contact` | `String?` | Persona de contacto |
| `email` | `String?` | Email |
| `phone` | `String?` | Teléfono |
| `businessId` | `String` | FK → `Business` |

---

### `StockMovement`
Movimientos de stock (trazabilidad).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `type` | `StockMovementType` | `ADJUSTMENT`, `SALE`, `PURCHASE`, `USAGE`, `RETURN` |
| `quantity` | `Int` | Cantidad (positiva o negativa) |
| `notes` | `String?` | Notas |
| `productId` | `String` | FK → `Product` |
| `businessId` | `String` | FK → `Business` |
| `createdAt` | `DateTime` | Fecha del movimiento |

---

### `Sale`
Ventas / tickets.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `status` | `SaleStatus` | `open`, `paid`, `refunded`, `voided` |
| `subtotal` | `Float` | Subtotal |
| `tax` | `Float` | Impuestos |
| `discount` | `Float` | Descuento |
| `total` | `Float` | Total |
| `paymentMethod` | `PaymentMethod?` | Método de pago |
| `clientId` | `String?` | FK → `Client` |
| `appointmentId` | `String?` | FK → `Appointment` |
| `businessId` | `String` | FK → `Business` |

---

### `SaleItem`
Líneas de una venta.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `type` | `SaleItemType` | `service`, `product` |
| `name` | `String` | Nombre del ítem |
| `price` | `Float` | Precio unitario |
| `quantity` | `Int` | Cantidad |
| `discount` | `Float` | Descuento |
| `serviceId` | `String?` | FK → `Service` |
| `productId` | `String?` | FK → `Product` |
| `saleId` | `String` | FK → `Sale` |

---

### `SlotWaitlistEntry`
Entradas en la lista de espera.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `serviceId` | `String?` | FK → `Service` |
| `preferredDate` | `DateTime?` | Fecha preferida |
| `preferredTimeFrom` | `String?` | Hora mínima preferida |
| `preferredTimeTo` | `String?` | Hora máxima preferida |
| `clientId` | `String?` | FK → `Client` |
| `userId` | `String?` | FK → `User` |
| `businessId` | `String` | FK → `Business` |

---

### `Profession`
Plantillas de profesión del sistema (gestionadas por el seed de IA).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Clave primaria |
| `name` | `String` (unique) | Nombre de la profesión |
| `description` | `String?` | Descripción |
| `categories` | `ProfessionCategory[]` | Categorías sugeridas |
| `services` | `ProfessionService[]` | Servicios sugeridos |
| `synonyms` | `ProfessionSynonym[]` | Sinónimos para detección IA |

---

## Enums

| Enum | Valores |
|---|---|
| `AppointmentStatus` | `pending`, `confirmed`, `cancelled`, `completed`, `no_show` |
| `PaymentStatus` | `pending`, `paid`, `refunded`, `partial` |
| `AppointmentOrigin` | `manual`, `online`, `widget` |
| `BlockStatus` | `active`, `cancelled` |
| `BonoType` | `session_pack`, `time_pack`, `unlimited`, `loyalty` |
| `SaleStatus` | `open`, `paid`, `refunded`, `voided` |
| `SaleItemType` | `service`, `product` |
| `PaymentMethod` | `cash`, `card`, `transfer`, `bono`, `mixed` |
| `StockMovementType` | `ADJUSTMENT`, `SALE`, `PURCHASE`, `USAGE`, `RETURN` |
| `SidebarPosition` | `left`, `right`, `none` |
| `CalendarAppearance` | `default`, `compact`, `spacious` |

---

## Gestión del esquema

```bash
# Crear nueva migración tras modificar schema.prisma
pnpm --filter server prisma:migrate

# Regenerar el cliente Prisma (tipos TypeScript)
pnpm --filter server prisma:generate

# Seed de datos iniciales (roles, plantillas de profesión)
pnpm --filter server prisma:seed

# Ver la BD en Prisma Studio
npx prisma studio --schema server/prisma/schema.prisma
```

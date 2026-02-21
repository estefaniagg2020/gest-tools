# Análisis de tablas de la base de datos

Mapa completo de qué se guarda en cada tabla del schema de Prisma.

---

## GestorConfig — Tabla central de configuración

Todo lo configurado desde `/config/*` se guarda aquí, vinculado al `businessId`.

| Sección de config | Campo(s) | Tipo |
|---|---|---|
| Idioma | `locale` | `String?` |
| Datos de empresa | `logoUrl`, `email`, `phone`, `address`, `numberOfPeople`, `taxId`, `businessAddress`, `businessPopulation`, `isCanarias` | varios |
| Profesión / actividad | `professionId` → FK a `Profession` | `String?` |
| Temas y colores | `themeId`, `colorMode`, `customColors` | `String?`, `Json?` |
| Agenda / cuadrícula | `startHour`, `endHour`, `pixelsPerHour`, `slotDurationMinutes`, `workDaysPerWeek`, `maxPeoplePerSlot`, `defaultView`, `weekStart` | `Int`, `String?` |
| Colores de agenda | `sameColorsForAll`, `agendaBg`, `markedDaysColor`, `vacationColor`, `perAgendaColors` | `Boolean`, `String`, `Json?` |
| Sidebar / layout | `sidebarPosition`, `showNavbar`, `calendarAppearance`, `sidebarModuleIds` | `Enum`, `Boolean`, `String[]` |
| Dashboard | `dashboardModuleIds` | `String[]` |
| Iconos del menú | `moduleIcons` | `Json?` |
| Títulos personalizados | `titleTextOverrides` | `Json?` |
| Notificaciones (WhatsApp) | `whatsappRemindersEnabled`, `whatsappPhoneNumberId` | `Boolean`, `String?` |
| Facturación / IVA | `defaultVatPercent`, `cartEnabled` | `Int`, `Boolean` |
| Módulos (bonos/servicios/inv.) | `bonosEnabled`, `serviciosEnabled`, `inventarioEnabled` | `Boolean` |
| Smart filling | `smartFillingEnabled`, `smartFillingDiscountPercent` | `Boolean`, `Int` |
| Reserva online | `bookingEnabled`, `depositPercent`, `depositRequired`, `description`, `publicPhoneNumber`, `slug`, `socialLinks` | varios |
| Onboarding | `onboardingComplete` | `Boolean` |
| Agendas personalizadas | `agendaListConfig` | `Json?` |
| Servicios ocultos del sistema | `hiddenSystemServiceNames` | `String[]` |

---

## Tablas de negocio

| Tabla | Qué guarda |
|---|---|
| `Company` | Empresa madre (nombre). Un company tiene N businesses. |
| `Business` | Cada negocio/centro: nombre, color, vinculado a un `Company`. |
| `Role` | Roles del sistema: nombre (unique), descripción. Valores: `superadmin`, `admin`, `employee`, `client`. |
| `User` | Usuarios del sistema (login): username, password, `roleId` → FK a `Role`, sessionToken. |
| `WorkspaceMember` | Miembros del equipo vinculados a un business: nombre, foto, teléfono, email, horarios, color de agenda, `roleId` → FK a `Role`. |

---

## Tablas de servicios y catálogo

| Tabla | Qué guarda |
|---|---|
| `ServiceCategory` | Categorías de servicios del negocio (label, icono). Vinculada a un business. |
| `Service` | Cada servicio: nombre, duración, precio, categoría, cabina/terapeuta, depósito, booking online. |
| `Profession` | Plantillas de profesión del sistema (peluquería, estética, veterinaria…). |
| `ProfessionCategory` | Categorías sugeridas por profesión (Corte, Color, etc.). |
| `ProfessionService` | Servicios sugeridos por profesión (plantillas del sistema). |
| `ProfessionSynonym` | Sinónimos para detectar profesión automáticamente. |

---

## Tablas de agenda y citas

| Tabla | Qué guarda |
|---|---|
| `Appointment` | Cada cita: servicio, cliente, miembro del equipo, fecha/hora, estado, pago, notas, carrito, origen (`manual`/`online`/`widget`). |
| `ScheduleBlock` | Bloques en la agenda (trabajo, descanso, vacaciones): miembro, fechas, tipo, estado. |

---

## Tablas de clientes

| Tabla | Qué guarda |
|---|---|
| `Client` | Clientes del negocio: nombre, email, teléfono, notas. |
| `ClientPhoto` | Fotos asociadas a un cliente. |

---

## Tablas de bonos

| Tabla | Qué guarda |
|---|---|
| `Bono` | Bonos de la empresa: nombre, sesiones, precio, tipo (`session_pack`/`time_pack`/`unlimited`/`loyalty`). Un negocio tiene muchos bonos. |
| `ClientBono` | Asociación cliente–bono (muchos a muchos): sesiones usadas, restantes, fecha de expiración. Un bono se asocia a muchos clientes y un cliente puede tener muchos bonos. |

---

## Tablas de inventario y ventas

| Tabla | Qué guarda |
|---|---|
| `Product` | Productos: nombre, SKU, código de barras, precio, coste, stock, stock mínimo. |
| `Supplier` | Proveedores: nombre, contacto, email, teléfono. |
| `StockMovement` | Movimientos de stock: cantidad, tipo (ajuste, venta, compra, uso, devolución). |
| `Sale` | Ventas: subtotal, impuestos, descuento, total, método de pago, estado. |
| `SaleItem` | Líneas de una venta: servicio o producto, precio, cantidad, descuento. |

---

## Tablas de lista de espera

| Tabla | Qué guarda |
|---|---|
| `SlotWaitlistEntry` | Entradas en la lista de espera: usuario o cliente, servicio, franja preferida. |
| `WaitlistNotification` | Avisos generados cuando se libera un hueco para alguien en lista de espera. |

---

## Enums

| Enum | Valores |
|---|---|
| `SidebarPosition` | `left`, `right`, `none` |
| `CalendarAppearance` | `default`, `compact`, `spacious` |
| ~~`UserRole`~~ | Eliminado. Sustituido por tabla `Role`. |
| `AppointmentStatus` | `pending`, `confirmed`, `cancelled`, `completed`, `no_show` |
| `PaymentStatus` | `pending`, `paid`, `refunded`, `partial` |
| `AppointmentOrigin` | `manual`, `online`, `widget` |
| `BlockStatus` | `active`, `cancelled` |
| `BonoType` | `session_pack`, `time_pack`, `unlimited` |
| ~~`WorkspaceRole`~~ | Eliminado. Sustituido por tabla `Role`. |
| `SaleStatus` | `open`, `paid`, `refunded`, `voided` |
| `SaleItemType` | `service`, `product` |
| `PaymentMethod` | `cash`, `card`, `transfer`, `bono`, `mixed` |
| `StockMovementType` | `ADJUSTMENT`, `SALE`, `PURCHASE`, `USAGE`, `RETURN` |
| ~~`EmployeeRole`~~ | Eliminado. Sustituido por tabla `Role`. |

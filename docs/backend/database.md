# Base de datos

- Motor: PostgreSQL
- ORM: Prisma
- Schema: `server/prisma/schema.prisma`

## Modelo principal

```text
Company (1) -> (N) Business
Business (1) -> (1) GestorConfig
Business (1) -> (N) WorkspaceMember
Business (1) -> (N) Client
Business (1) -> (N) Appointment
Business (1) -> (N) ScheduleBlock
Business (1) -> (N) BusinessCategory -> (N) BusinessService
Business (1) -> (N) Bono -> (N) ClientBono
Business (1) -> (N) Product -> (N) StockMovement
Business (1) -> (N) Supplier
Business (1) -> (N) Sale -> (N) SaleItem
Business (1) -> (N) SlotWaitlistEntry
User (1) -> (N) WorkspaceMember
Role (1) -> (N) User
Role (1) -> (N) WorkspaceMember
```

## Nota de naming

En Prisma se usan modelos `BusinessCategory` y `BusinessService`, mapeados a tablas SQL `ServiceCategory` y `Service` (`@@map`).

## Modelos clave

| Modelo | Propósito |
|---|---|
| `Company` | Entidad organizativa madre |
| `Business` | Negocio operativo (tenant) |
| `GestorConfig` | Configuración del negocio |
| `User` | Credenciales y sesión |
| `Role` | Roles de acceso |
| `WorkspaceMember` | Miembros del equipo por negocio |
| `BusinessCategory` | Categorías de servicios por negocio |
| `BusinessService` | Servicios por negocio |
| `Client` | Clientes |
| `Appointment` | Citas |
| `ScheduleBlock` | Bloques de agenda |
| `Bono` / `ClientBono` | Bonos y asignación a clientes |
| `Product` / `Supplier` / `StockMovement` | Inventario |
| `Sale` / `SaleItem` | Ventas |
| `SlotWaitlistEntry` / `WaitlistNotification` | Lista de espera |
| `Profession*` | Catálogo/plantillas de profesiones |

## Enums relevantes

- `AppointmentStatus`: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`
- `PaymentStatus`: `pending`, `paid`, `refunded`, `partial`
- `AppointmentOrigin`: `manual`, `online`, `widget`
- `BlockStatus`: `active`, `cancelled`
- `BonoType`: `session_pack`, `time_pack`, `unlimited`, `loyalty`
- `SaleStatus`: `open`, `paid`, `refunded`, `voided`
- `SaleItemType`: `service`, `product`
- `PaymentMethod`: `cash`, `card`, `transfer`, `bono`, `mixed`
- `StockMovementType`: `ADJUSTMENT`, `SALE`, `PURCHASE`, `USAGE`, `RETURN`

## Flujo de cambios de schema

```bash
pnpm --filter server prisma:migrate
pnpm --filter server prisma:generate
pnpm --filter server prisma:seed
```

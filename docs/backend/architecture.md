# Arquitectura del Backend

Backend en Express 5 + Prisma 7 + PostgreSQL.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20+ |
| HTTP | Express 5 |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| DB | PostgreSQL 15 |
| Testing | Vitest + Supertest |

## Estructura

```text
server/src/
  index.ts
  routes/
  middleware/
  services/
  utils/
```

## Inicialización (`src/index.ts`)

1. `dotenv.config()`
2. `pg.Pool(DATABASE_URL)`
3. `PrismaClient({ adapter: PrismaPg })`
4. Middlewares globales (`cors`, `express.json`, logger)
5. Registro de rutas `/api/*`
6. Error handler global
7. Seeds operativos al arranque (`ensureRoleTemplates`, `ensureProfessionTemplates`)

## Autenticación y roles

- `requireAuth(prisma)`: valida `Bearer sessionToken` y rellena `req.user`.
- `requireStaff`: `superadmin | admin | employee`.
- `requireAdmin`: `superadmin | admin`.
- `requireSuperadmin`: `superadmin`.

## Multi-tenant

El aislamiento principal se basa en `businessId` del usuario autenticado. Parte de rutas usan ese `businessId` de `req.user`; otras rutas todavía aceptan `businessId` en request sin `requireAuth`.

## Rutas

Módulos activos:
- `auth`, `public`, `companies`, `businesses`, `employees`, `dashboard`, `bookings`, `waitlist`, `reminders`, `inventory`, `appointments`, `clients`, `schedule-blocks`, `bonos`, `service-categories`, `settings`, `professions`, `sales`, `ai`.

Referencia completa en `./api-reference.md`.

## Errores

- Manejo global con respuesta JSON `{ error: string }`.
- Algunas rutas devuelven mensajes de error funcionales (validación, conflicto, permisos).

## Variables de entorno relevantes

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `PORT` | Puerto HTTP |
| `CRON_SECRET` | Protección opcional de `/api/reminders/send` |
| `WHATSAPP_ACCESS_TOKEN` | Integración WhatsApp |
| `GEMINI_API_KEY` | Descubrimiento IA de profesiones |

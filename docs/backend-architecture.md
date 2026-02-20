# Arquitectura del Backend

Documentación técnica del backend de gest-tools: decisiones de diseño, stack, estructura y flujos.

---

## Stack

| Capa | Tecnología | Versión | Motivo |
|---|---|---|---|
| Runtime | Node.js | 20+ | Ecosistema maduro, TypeScript nativo con tsx |
| Framework HTTP | Express.js | 5 | Estándar de facto, minimalista, rutas modulares |
| ORM | Prisma | 7 | Type-safety total, migraciones declarativas, studio |
| Base de datos | PostgreSQL | 15 | Relacional, integridad referencial, JSONB para datos flexibles |
| Driver adapter | `@prisma/adapter-pg` | latest | Control fino del pool de conexiones |
| Testing | Vitest + Supertest | latest | Rápido, compatible con ESM, mismo runner que frontend |

---

## Estructura de carpetas

```
server/
├── src/
│   ├── index.ts              # Bootstrap: Express, Prisma, rutas, error handler
│   ├── routes/               # 19 módulos de rutas (una por recurso)
│   │   ├── auth.ts
│   │   ├── appointments.ts
│   │   ├── bonos.ts
│   │   ├── bookings.ts
│   │   ├── businesses.ts
│   │   ├── clients.ts
│   │   ├── companies.ts
│   │   ├── dashboard.ts
│   │   ├── employees.ts
│   │   ├── inventory.ts
│   │   ├── professions.ts
│   │   ├── public.ts
│   │   ├── reminders.ts
│   │   ├── sales.ts
│   │   ├── schedule-blocks.ts
│   │   ├── service-categories.ts
│   │   ├── settings.ts
│   │   ├── waitlist.ts
│   │   └── ai.ts
│   ├── middleware/
│   │   └── auth.ts           # requireAuth, requireStaff, requireAdmin, requireSuperadmin
│   ├── services/
│   │   ├── aiProfessionDiscovery.ts
│   │   ├── aiSlotParser.ts
│   │   ├── availability.ts
│   │   ├── ensureTemplates.ts
│   │   ├── professionService.ts
│   │   ├── waitlist.ts
│   │   └── whatsapp.ts
│   ├── types/
│   │   └── express.d.ts      # Extensión de tipos de Request (req.user)
│   └── utils/
│       └── password.ts       # hash, salt, verify, generateSessionToken
├── prisma/
│   ├── schema.prisma         # Esquema de la BD (modelos, enums, relaciones)
│   └── migrations/           # Historial de migraciones SQL
├── scripts/
│   └── reset-db.ts           # Script para resetear la BD en desarrollo
└── vitest.config.ts
```

---

## Inicialización del servidor (`src/index.ts`)

```typescript
// Flujo de arranque
dotenv.config()
→ pg.Pool(DATABASE_URL)
→ PrismaPg(pool)
→ PrismaClient({ adapter })
→ Express app
  → cors()
  → express.json()
  → logger middleware
  → /health endpoint
  → mount 19 route modules
  → global error handler
→ ensureProfessionTemplates(prisma)  // seed de IA al arrancar
→ app.listen(PORT)
```

---

## Patrón de rutas modulares

Cada módulo de ruta sigue la misma firma:

```typescript
export const resourceRouter = (prisma: PrismaClient): Router => {
  const router = Router()
  const auth = requireAuth(prisma)
  
  router.get('/', auth, requireStaff, async (req, res) => { ... })
  router.post('/', auth, requireStaff, async (req, res) => { ... })
  // ...
  
  return router
}
```

**Ventaja:** `PrismaClient` se inyecta desde `index.ts`, lo que facilita el testing (inyección del cliente mock en tests).

---

## Autenticación

### Mecanismo

1. El cliente envía `Authorization: Bearer <sessionToken>` en cada request.
2. `requireAuth(prisma)` busca el token en la tabla `User.sessionToken`.
3. Si es válido, adjunta `req.user` con `{ id, businessId, role }`.
4. Si no es válido, responde `401`.

### Expiración de sesión

El token no caduca por tiempo. Se invalida explícitamente al:
- Hacer logout (`POST /api/auth/logout`).
- Cambiar contraseña (`POST /api/auth/change-password`).
- Resetear contraseña (`POST /api/auth/forgot-password`).

### Hashing de contraseñas

`server/src/utils/password.ts` implementa hashing con sal usando `node:crypto`:
- `generateSalt()` → 16 bytes aleatorios en hex.
- `hashPassword(password, salt)` → SHA-256 de `password + salt`.
- `verifyPassword(input, salt, hash)` → compara hashes.

> No usa bcrypt ni argon2 para evitar dependencias nativas, manteniendo compatibilidad con Docker sin compiladores.

---

## Multi-tenancy

El sistema es **multi-tenant por `businessId`**:

- Cada `WorkspaceMember` está vinculado a un `Business`.
- Al autenticar, `req.user.businessId` se extrae del primer workspace del usuario.
- Todas las queries de datos filtran por `businessId` para aislar los datos entre negocios.

```typescript
const getBizId = (req: Request): string => req.user?.businessId ?? ""
// Todas las queries: where: { businessId }
```

---

## Servicios de dominio

### `availability.ts`
Calcula las franjas horarias disponibles para un servicio, miembro del equipo y fecha. Tiene en cuenta:
- Horario del miembro (`workDays`, `scheduleStart`, `scheduleEnd`).
- Citas existentes en la BD.
- Bloques de horario activos (vacaciones, etc.).
- Duración del servicio.

### `waitlist.ts`
Lógica de lista de espera:
- Buscar entradas de waitlist que coincidan con el hueco liberado.
- Crear `WaitlistNotification` para los clientes afectados.

### `whatsapp.ts`
Integración con la API de WhatsApp Business para enviar recordatorios de cita.

### `ensureTemplates.ts`
Al arrancar el servidor, comprueba que existan las plantillas de profesión en la BD y las crea si no están (seed automático).

### `aiProfessionDiscovery.ts` / `aiSlotParser.ts`
Servicios de IA para:
- Detectar la profesión del negocio a partir de texto libre.
- Parsear horarios expresados en lenguaje natural.

---

## Gestión de errores

### Error handler global

```typescript
app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : String(err)
  const status = err?.statusCode ?? 500
  res.status(status).json({ error: message })
})
```

Captura cualquier error no manejado en los route handlers y devuelve una respuesta JSON consistente.

### Errores esperados

Los route handlers usan `try/catch` y devuelven errores descriptivos:

```typescript
try {
  // lógica
} catch (error) {
  res.status(500).json({ error: "Failed to fetch appointments" })
}
```

---

## Testing

Los tests de integración del backend usan **Vitest + Supertest**:

```typescript
// Patrón de tests
describe('appointments', () => {
  it('should_return_appointments_when_authenticated', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
    
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
  })
})
```

**Archivos de tests:** `server/src/__tests__/`

```bash
pnpm --filter server test            # Ejecutar tests
pnpm --filter server test:coverage   # Con cobertura
```

---

## Prisma: flujo de trabajo

```
1. Modificar server/prisma/schema.prisma
2. pnpm --filter server prisma:migrate   → genera SQL y actualiza la BD
3. pnpm --filter server prisma:generate  → actualiza tipos TypeScript
4. El servidor TypeScript recoge los cambios automáticamente
```

### Driver Adapter (PrismaPg)

En Prisma 7, cuando `DATABASE_URL` se pasa en runtime (no hardcodeada en el schema), se recomienda usar un **Driver Adapter**:

```typescript
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

Ventajas:
- Control del pool de conexiones.
- Mejor rendimiento en producción.
- Compatibilidad con entornos edge/serverless.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:password@localhost:5432/gest_tools` |
| `PORT` | Puerto del servidor (default: 3000) | `3000` |

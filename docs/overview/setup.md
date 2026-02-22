# Guía de instalación y configuración

Pasos para levantar el entorno de desarrollo local.

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker | 24+ |
| Docker Compose | 2+ |

## 1. Clonar e instalar

```bash
git clone <repo-url> gest-tools
cd gest-tools
pnpm install
```

## 2. Variables de entorno

Crear `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gest_tools"
PORT=3000
```

Opcional en frontend (`client/.env`) si no usas el proxy local:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 3. Levantar base de datos

```bash
docker compose up -d
```

## 4. Migraciones y seed

```bash
pnpm --filter server prisma:migrate
pnpm --filter server prisma:seed
```

## 5. Ejecutar el proyecto

```bash
pnpm dev
```

Servicios:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health: `http://localhost:3000/health`

## Comandos útiles

```bash
pnpm dev:client
pnpm dev:server
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm format
```

Backend:

```bash
pnpm --filter server prisma:generate
pnpm --filter server reset-db
pnpm --filter server clear-db-keep-categories
pnpm --filter server clear-user-data
pnpm --filter server clear-appointments
```

## Solución de problemas

### `DATABASE_URL` no definida
Verifica que existe `server/.env`.

### Error de conexión a PostgreSQL

```bash
docker compose ps
docker compose logs db
```

### Error de migración `P1001`
La base de datos aún no está lista. Espera unos segundos y repite.

### Puerto ocupado (5173 o 3000)
- Frontend: ajustar `client/vite.config.ts`
- Backend: ajustar `PORT` en `server/.env`

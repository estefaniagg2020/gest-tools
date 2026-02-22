# gest-tools

Sistema de gestión para negocios de salud, belleza y bienestar.

## Stack

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vitest, Playwright.
- Backend: Node.js, Express 5, Prisma 7, PostgreSQL.
- Monorepo: pnpm workspaces.

## Estructura

```text
gest-tools/
  client/
  server/
  docs/
  docker-compose.yml
  package.json
```

## Requisitos

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Puesta en marcha

```bash
git clone <repo-url> gest-tools
cd gest-tools
pnpm install
```

Crear `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gest_tools"
PORT=3000
```

Levantar base de datos y migrar:

```bash
docker compose up -d
pnpm --filter server prisma:migrate
pnpm --filter server prisma:seed
pnpm dev
```

Servicios:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health: `http://localhost:3000/health`

## Scripts raíz

```bash
pnpm dev
pnpm dev:client
pnpm dev:server
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm typecheck
pnpm format
```

## Documentación

- Índice general: `docs/README.md`
- Setup: `docs/overview/setup.md`
- Arquitectura global e integración: `docs/integration/architecture.md`, `docs/integration/front-back-link.md`
- Backend: `docs/backend/architecture.md`, `docs/backend/api-reference.md`, `docs/backend/database.md`
- Producto: `docs/product/features.md`
- Frontend (vistas): `docs/frontend/*`
- Auditoría técnica: `docs/audits/configuration-persistence-audit.md`

## Testing

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
```

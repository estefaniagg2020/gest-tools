# Guía de instalación y configuración

Pasos detallados para levantar el entorno de desarrollo completo.

---

## Requisitos previos

| Herramienta | Versión mínima | Comprobación |
|---|---|---|
| Node.js | 20+ | `node --version` |
| pnpm | 9+ | `pnpm --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2+ | `docker compose version` |

### Instalar pnpm (si no está instalado)

```bash
npm install -g pnpm
```

---

## 1. Clonar el repositorio

```bash
git clone <repo-url> gest-tools
cd gest-tools
```

---

## 2. Instalar dependencias

```bash
pnpm install
```

Esto instala las dependencias de todos los workspaces (`client/` y `server/`) en un único paso gracias a pnpm workspaces.

---

## 3. Configurar variables de entorno

### Backend

Crea el fichero `server/.env`:

```bash
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/gest_tools"
PORT=3000
```

> Los valores de `DATABASE_URL` coinciden con los definidos en `docker-compose.yml`.

### Frontend (opcional)

Crea `client/.env` solo si el backend corre en una URL diferente a la predeterminada:

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 4. Levantar la base de datos

```bash
docker compose up -d
```

Esto arranca un contenedor PostgreSQL 15 en el puerto `5432`. Los datos se persisten en el volumen `postgres_data`.

**Verificar que el contenedor está corriendo:**

```bash
docker compose ps
```

**Ver logs de la BD:**

```bash
docker compose logs db
```

---

## 5. Migraciones de base de datos

```bash
pnpm --filter server prisma:migrate
```

Aplica todas las migraciones pendientes y crea las tablas.

---

## 6. Seed de datos iniciales

```bash
pnpm --filter server prisma:seed
```

Crea:
- Los 4 roles del sistema: `superadmin`, `admin`, `employee`, `client`
- Las plantillas de profesión para la detección por IA

---

## 7. Iniciar el entorno de desarrollo

```bash
pnpm dev
```

Arranca en paralelo:
- **Frontend** (Vite dev server) → `http://localhost:5173`
- **Backend** (tsx watch) → `http://localhost:3000`

### Puertos y proxy

El frontend y el backend corren en puertos distintos para evitar conflictos:

| Servicio | Puerto | URL |
|---|---|---|
| **Frontend** (Vite) | 5173 | http://localhost:5173 |
| **Backend** (Express) | 3000 | http://localhost:3000 |
| **Health check** | 3000 | http://localhost:3000/health |

Las peticiones a `/api/*` desde el frontend se reenvían automáticamente al backend mediante el proxy de Vite (`client/vite.config.ts`). En desarrollo no hace falta configurar `VITE_API_URL`; el proxy gestiona el enrutamiento.

### Arrancar por separado

```bash
pnpm dev:client    # solo frontend (puerto 5173)
pnpm dev:server    # solo backend (puerto 3000)
```

---

## 8. Primer acceso — Setup inicial

Al abrir `http://localhost:5173` por primera vez, la app detecta que no hay usuarios y muestra la pantalla de **setup inicial** (`/setup`).

1. Introduce un nombre de usuario y contraseña (mínimo 4 caracteres).
2. Esto crea automáticamente el primer usuario con rol `superadmin`, una `Company` y un `Business` asociado.
3. Queda iniciada sesión automáticamente y redirige al dashboard.

---

## Comandos útiles

### Prisma

```bash
# Ver el schema actual en el navegador
npx prisma studio --schema server/prisma/schema.prisma

# Resetear la BD (elimina todos los datos y re-aplica migraciones)
pnpm --filter server exec tsx server/scripts/reset-db.ts

# Regenerar el cliente Prisma tras cambios en el schema
pnpm --filter server prisma:generate
```

### Docker

```bash
docker compose up -d        # Iniciar BD
docker compose stop         # Parar BD (sin borrar datos)
docker compose down         # Parar y eliminar contenedor
docker compose down -v      # Parar y eliminar contenedor + datos
```

### Tests

```bash
pnpm test                   # Todos los tests (unit + integration)
pnpm test:client            # Solo tests del frontend
pnpm test:server            # Solo tests del backend
pnpm test:coverage          # Con reporte de cobertura
pnpm test:e2e               # Tests E2E con Playwright
```

### Formato y tipos

```bash
pnpm format                 # Formatear todo con Prettier
pnpm typecheck              # Verificar tipos TypeScript (frontend)
```

---

## Solución de problemas comunes

### Error: `DATABASE_URL` no definida

Asegúrate de que existe `server/.env` con la variable `DATABASE_URL`. El servidor la carga con `dotenv`.

### Error de conexión a PostgreSQL

Verifica que el contenedor Docker está corriendo:

```bash
docker compose ps
docker compose logs db
```

Comprueba que el puerto `5432` no está ocupado por otra instancia de PostgreSQL:

```bash
lsof -i :5432
```

### Error al ejecutar migraciones: `P1001 Can't reach database server`

El contenedor de PostgreSQL puede tardar unos segundos en estar listo. Espera y vuelve a intentarlo.

### Error `Cannot find module` en el server

Regenera el cliente de Prisma:

```bash
pnpm --filter server prisma:generate
```

### Puerto 5173 o 3000 ya en uso

Cambia el puerto en la configuración:
- **Frontend**: `client/vite.config.ts` → `server.port` (por defecto 5173). Si cambias el puerto del backend, actualiza también `server.proxy["/api"].target`.
- **Backend**: variable de entorno `PORT` en `server/.env` (por defecto 3000).

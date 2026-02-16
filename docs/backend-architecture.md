# Documentación Detallada: Sistema Backend

Este documento explica la implementación del backend para `gest-tools`, las decisiones tecnológicas tomadas y cómo funciona el sistema.

## 1. Arquitectura General

El backend se ha construido siguiendo un stack moderno y escalable:
- **Entorno**: Node.js con TypeScript.
- **Framework Web**: Express.js.
- **Base de Datos**: PostgreSQL (ejecutado en Docker).
- **ORM**: Prisma 7.

```mermaid
graph LR
    A[Frontend (Vue)] -->|HTTP/JSON| B[Express.js Server]
    B -->|Prisma Client| C[Prisma ORM]
    C -->|Adapter-PG| D[PostgreSQL Database]
```

## 2. Por qué estas tecnologías?

### Express.js
Es el estándar de facto para Node.js. Es minimalista, rápido y nos permite definir rutas de API de forma muy clara.

### PostgreSQL
Como gestor de bases de datos relacionales, PostgreSQL asegura que la integridad de tus datos (Therapists, Services, Spas) esté protegida mediante relaciones y tipos de datos estrictos.

### Prisma 7 (ORM)
Prisma actúa como un puente entre el código TypeScript y la base de datos.
- **Seguridad de Tipos**: Si cambias el esquema de la base de datos, TypeScript te avisará si el código se rompe.
- **Prisma 7**: Es la versión más reciente. Una de sus ventajas es que separa la configuración de la base de datos (`prisma.config.ts`) del esquema puramente lógico (`schema.prisma`).

## 3. Estructura del Proyecto

El backend vive en la carpeta `/server`:

- **`src/index.ts`**: El punto de entrada. Aquí se configura el servidor Express, los middlewares (CORS, JSON) y se inicializa la conexión con la base de datos.
- **`prisma/schema.prisma`**: Define tus modelos de datos (`Spa`, `Therapist`, `Service`). Es el "plano" de tu base de datos.
- **`prisma.config.ts`**: Configuración técnica de Prisma (dónde están las migraciones, URL de la base de datos).
- **`docker-compose.yml`**: (En la raíz) Define cómo se levanta PostgreSQL en un contenedor para que no tengas que instalarlo manualmente en tu sistema.

## 4. Detalles de Implementación Críticos

### Conectividad (Driver Adapter)
En Prisma 7, cuando la URL no está "hardcoded" en el esquema, se recomienda el uso de **Driver Adapters**. 
He configurado `@prisma/adapter-pg` y el paquete `pg`. Esto permite que el servidor tenga un control más fino sobre el pool de conexiones a PostgreSQL, mejorando el rendimiento.

### Flujo de Trabajo
1.  **Modificar Esquema**: Cambias algo en `schema.prisma`.
2.  **Migrar**: Ejecutas `npm run prisma:migrate` para que PostgreSQL cree las tablas.
3.  **Generar**: `npx prisma generate` actualiza los tipos de TypeScript para que coincidan con los cambios.

## 5. Cómo usarlo

### Iniciar Base de Datos
```bash
docker compose up -d
```

### Iniciar Servidor (Desarrollo)
```bash
cd server
npm run dev
```
Esto usa `tsx watch`, que reinicia el servidor automáticamente cuando guardas cambios en el código.

### Endpoints Disponibles
- `GET /health`: Para verificar que el servidor vive.
- `GET /api/spas`: Lista todos los centros.
- `GET /api/therapists`: Lista todos los terapeutas con su Spa asociado.

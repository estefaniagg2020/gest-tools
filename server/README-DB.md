# Base de Datos - Setup y Seed

Este documento explica cómo configurar y mantener datos de prueba en la base de datos.

## Scripts Disponibles

### `pnpm setup`
Ejecuta migraciones y seed de forma segura. **Idempotente**: no duplica datos existentes.

```bash
cd server
pnpm setup
```

**Uso recomendado**: Al iniciar el entorno por primera vez o después de cambios en el schema.

### `pnpm reset-db`
**Limpia toda la base de datos** y vuelve a crear datos de prueba desde cero.

```bash
cd server
pnpm reset-db
```

**⚠️ Advertencia**: Esto elimina TODOS los datos existentes (citas, clientes, empleados, etc.).

**Uso recomendado**: Cuando quieras empezar desde cero con datos limpios.

### `pnpm prisma:seed`
Ejecuta solo el seed (sin migraciones). El seed es **idempotente**: verifica existencia antes de crear.

```bash
cd server
pnpm prisma:seed
```

**Uso recomendado**: Cuando solo quieras asegurar que hay datos de prueba sin ejecutar migraciones.

## Datos de Prueba Incluidos

El seed crea automáticamente:

- **Usuario admin**: `admin` / `admin`
- **Empresa y negocio**: "Demo Clínica SL" / "Clínica Estética Demo"
- **4 empleados**: Ana García, Carlos Ruiz, María López, Pedro Martínez
- **5 servicios**: Masaje Relajante, Limpieza Facial, Manicura, Depilación, Tratamiento Antiedad
- **6 clientes**: Laura Fernández, Miguel Torres, Sofía Blanco, Javier Moreno, Carmen Díaz, Antonio Sánchez
- **~30 citas** distribuidas en febrero 2026 (algunas pasadas, algunas futuras, algunas canceladas)

## Flujo Recomendado al Iniciar el Entorno

```bash
# 1. Asegurar migraciones y datos
cd server
pnpm setup

# 2. Iniciar servidor
pnpm dev
```

## Notas

- El seed es **idempotente**: puedes ejecutarlo múltiples veces sin crear duplicados.
- Si necesitas datos completamente frescos, usa `pnpm reset-db`.
- Los datos de prueba están diseñados para generar estadísticas realistas en el dashboard.

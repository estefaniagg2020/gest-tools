# Vista: Spas / Centros

**Ruta legacy:** `/spas`

## Estado actual

La ruta `/spas` no tiene vista propia en la app actual. En el router redirige a `services`.

- Configuración en router: `path: "spas" -> redirect: { name: "services" }`.
- Módulo funcional vigente relacionado: **Servicios** (`/services`).

## Implicación documental

Si se necesita volver a separar gestión de centros como módulo independiente, conviene crear una vista dedicada y documentarla como dominio propio. Mientras tanto, este archivo se mantiene para trazabilidad histórica.

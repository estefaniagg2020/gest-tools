# Vista: Inicio (Dashboard)

**Ruta:** `/`

## Descripción

Pantalla principal tras el login. Muestra un resumen ejecutivo para el manager: métricas, gráfico de ingresos, acciones rápidas y timeline de actividad reciente.

## Contenido

- **Cabecera:** Fecha actual, usuario actual (nombre/foto según rol), selector de usuario (solo manager) y rol (Manager / Empleado).
- **Tarjetas de métricas:** Ingresos, reservas, satisfacción, ocupación (valores simulados o derivados).
- **Gráfico de ingresos:** Evolución semanal (datos de demostración).
- **Acciones rápidas:** Enlaces a Agenda, Equipo y Centros Spa.
- **Timeline de actividad:** Actividad reciente simulada y tip del día.

## Rol

Visible para todos. El contenido y el selector de usuario en cabecera pueden variar según si el usuario es Manager o Empleado.

## Dependencias

- `authStore` (rol, usuario actual)
- `therapistStore` (lista de terapeutas para selector y métricas)
- Datos de dashboard en `useDashboard` / configuración en `data/dashboardConfig.ts`

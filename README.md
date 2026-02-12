# Base Vue

Proyecto base con Vue 3 + Vite + TypeScript.

## Requisitos

- Node.js (recomendado 20+)
- pnpm

## Instalacion

1. Instala dependencias:

```bash
pnpm install
```

2. Inicia el entorno de desarrollo:

```bash
pnpm dev
```

La app estara disponible en la URL que Vite indique en consola (por defecto `http://localhost:5173`).

## Scripts utiles

```bash
pnpm dev        # servidor de desarrollo
pnpm build      # build de produccion
pnpm preview    # previsualizar build
pnpm test       # ejecutar tests con Vitest
pnpm test:ui    # UI de Vitest
pnpm typecheck  # verificacion de tipos
```

## Estructura basica

- `src/main.ts`: punto de entrada
- `src/App.vue`: componente raiz
- `src/router`: rutas
- `src/stores`: stores (Pinia)
- `src/test`: configuracion y tests

## Prueba / Demostración (sin backend)

La aplicación incluye un flujo de **cambio de rol** (Manager / Empleado) con un popup de contraseña solo para simular la autenticación. No hay backend real.

- **Contraseña demo para cambiar de rol:** `demo`
- En la barra lateral, haz clic en el bloque de usuario (nombre + "Cambiar Rol ⚡"). Se abre un modal donde puedes elegir rol (Manager o Empleado), si eres empleado seleccionar qué empleado eres en la lista, y escribir la contraseña. Con la contraseña `demo` se confirma el cambio.
- Los datos (agenda, terapeutas, spas, peticiones rechazadas) se persisten en `localStorage`.

Para más detalle por pantalla (qué hace cada vista, roles, persistencia), ver la carpeta **[docs/](./docs/)** (índice en `docs/README.md`).

## Notas

- Usa `pnpm` porque el repo incluye `pnpm-lock.yaml`.
- Si necesitas variables de entorno, crea un `.env` siguiendo la convencion de Vite (prefijo `VITE_`).

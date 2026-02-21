# Tests

Tests unitarios organizados por **responsabilidad** (capa o módulo del proyecto).

## Estructura

```
tests/
└── unit/                    # Tests unitarios
    ├── data/                # Configuración y datos estáticos (authConfig, dashboard, navLinks, etc.)
    ├── infrastructure/      # Adapters de persistencia (localStorage)
    ├── utils/               # Utilidades puras (avatar, color, scheduleGenerator, etc.)
    ├── stores/              # Stores Pinia (auth, schedule, spa, therapist, etc.)
    ├── composables/         # Composables Vue (useScheduleDates, useToast, etc.)
    └── router/              # Configuración de rutas
```

## Ejecución

- `pnpm test` — ejecuta todos los tests (watch por defecto)
- `pnpm test --run` — una sola ejecución
- `pnpm test --run --coverage` — con reporte de cobertura

## Convenciones

- Nombres de tests: `should_<expected>_when_<context>`
- Imports desde `@/` (alias a `src/`)
- Arrange / Act / Assert (AAA)

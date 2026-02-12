/**
 * Configuración centralizada de autenticación y roles.
 * Evita números y cadenas mágicas en el resto del código.
 */
export const AUTH_CONFIG = {
  /** Rol por defecto al cargar la aplicación */
  DEFAULT_ROLE: "manager",
  /** User ID por defecto (manager) */
  DEFAULT_USER_ID: "5",
  /** User IDs usados en el toggle manager/employee (demo) */
  TOGGLE_USER_IDS: {
    manager: "5",
    employee: "1",
  } as const,
  /** User ID del usuario con rol manager (usado en dashboard, header, etc.) */
  MANAGER_USER_ID: "5",
  /** Identificador de rol manager para comparaciones */
  ROLE_MANAGER: "manager",
  /** Identificador de rol employee para comparaciones */
  ROLE_EMPLOYEE: "employee",
  /** User IDs que se consideran manager (p. ej. alias legacy) para nombre/foto en dashboard */
  MANAGER_USER_IDS: ["5", "admin"] as const,
  /** Nombre mostrado para el usuario manager cuando no se resuelve desde datos */
  MANAGER_DISPLAY_NAME: "Antonio",
  /** Contraseña de demostración para el popup de cambio de rol (sin backend) */
  DEMO_PASSWORD: "demo",
} as const;

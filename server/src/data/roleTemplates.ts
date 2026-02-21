export interface RoleDef {
  name: string;
  description: string | null;
}

export const ROLE_TEMPLATES: RoleDef[] = [
  { name: "superadmin", description: "Acceso total al sistema" },
  { name: "admin", description: "Administrador del negocio" },
  { name: "employee", description: "Empleado o profesional" },
  { name: "client", description: "Cliente del negocio" },
];

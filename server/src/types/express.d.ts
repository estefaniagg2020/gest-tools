export type RoleName = "superadmin" | "admin" | "employee" | "client";

export interface AuthUser {
  id: string;
  username: string;
  role: RoleName;
  name: string | null;
  email: string | null;
  phone: string | null;
  businessId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthUser {
  id: string;
  username: string;
  role: "gestor" | "client";
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

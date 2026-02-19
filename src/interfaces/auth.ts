export type BackendRole = "gestor" | "client";

export interface User {
  id: string;
  username: string;
  role?: BackendRole;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  businessId?: string | null;
}

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  sessionToken?: string;
}

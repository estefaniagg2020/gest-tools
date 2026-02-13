export interface User {
  id: string;
  username: string;
}

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  sessionToken?: string;
}

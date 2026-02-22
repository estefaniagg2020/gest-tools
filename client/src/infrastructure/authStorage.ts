import type { User } from "@/interfaces";

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  sessionToken?: string;
}

const KEY_USERS = "auth-users";
const KEY_REMEMBERED = "auth-remembered";
const KEY_TOKEN = "auth-token";
const KEY_BACKEND_USER = "auth-user";

function isStoredUserArray(value: unknown): value is StoredUser[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "username" in item &&
      "passwordHash" in item &&
      "salt" in item,
  );
}

export function loadStoredUsers(): StoredUser[] | null {
  const raw = localStorage.getItem(KEY_USERS);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isStoredUserArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

export function loadRememberedSession(): { sessionToken: string } | null {
  const raw = localStorage.getItem(KEY_REMEMBERED);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "object" && parsed !== null && "sessionToken" in parsed && typeof (parsed as { sessionToken: unknown }).sessionToken === "string") {
      return { sessionToken: (parsed as { sessionToken: string }).sessionToken };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveRememberedSession(sessionToken: string): void {
  localStorage.setItem(KEY_REMEMBERED, JSON.stringify({ sessionToken }));
}

export function clearRememberedSession(): void {
  localStorage.removeItem(KEY_REMEMBERED);
}

function isBackendUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "username" in value &&
    typeof (value as User).id === "string" &&
    typeof (value as User).username === "string"
  );
}

export function saveBackendSession(token: string, user: User): void {
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_BACKEND_USER, JSON.stringify(user));
}

export function loadBackendSession(): { token: string; user: User } | null {
  const token = localStorage.getItem(KEY_TOKEN);
  const rawUser = localStorage.getItem(KEY_BACKEND_USER);
  if (!token || !rawUser) return null;
  try {
    const user = JSON.parse(rawUser) as unknown;
    if (!isBackendUser(user)) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function loadBackendToken(): string | null {
  return localStorage.getItem(KEY_TOKEN);
}

export function clearBackendSession(): void {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_BACKEND_USER);
}

export function clearAllUserAndSessionData(): void {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_BACKEND_USER);
  localStorage.removeItem(KEY_USERS);
  localStorage.removeItem(KEY_REMEMBERED);
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("layout-config-") || key?.startsWith("gestor-config-")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

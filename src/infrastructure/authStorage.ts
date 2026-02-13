import type { StoredUser } from "@/interfaces";

const KEY_USERS = "auth-users";
const KEY_REMEMBERED = "auth-remembered";

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

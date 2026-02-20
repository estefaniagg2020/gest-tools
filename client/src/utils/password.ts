const encoder = new TextEncoder();

function toHexBytes(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const data = encoder.encode(salt + password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return toHexBytes(new Uint8Array(buffer));
};

export const verifyPassword = async (
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> => {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
};

export const generateSalt = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHexBytes(bytes);
};

export const generateSessionToken = (): string => {
  return crypto.randomUUID();
};

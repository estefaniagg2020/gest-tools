import crypto from "crypto";

export const hashPassword = (password: string, salt: string): string => {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
};

export const verifyPassword = (
  password: string,
  salt: string,
  storedHash: string,
): boolean => {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
};

export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateSessionToken = (): string => {
  return crypto.randomUUID();
};

export const generateTemporaryPassword = (length = 8): string => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let result = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
};

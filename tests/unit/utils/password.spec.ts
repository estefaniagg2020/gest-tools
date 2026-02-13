import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateSalt, generateSessionToken } from "@/utils/password";

describe("password utils", () => {
  it("should_hash_password_with_salt", async () => {
    const salt = "abc123";
    const hash = await hashPassword("mypass", salt);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should_produce_same_hash_for_same_input", async () => {
    const salt = "same";
    const h1 = await hashPassword("pass", salt);
    const h2 = await hashPassword("pass", salt);
    expect(h1).toBe(h2);
  });

  it("should_verify_password_when_correct", async () => {
    const salt = generateSalt();
    const hash = await hashPassword("secret", salt);
    const ok = await verifyPassword("secret", salt, hash);
    expect(ok).toBe(true);
  });

  it("should_not_verify_password_when_wrong", async () => {
    const salt = generateSalt();
    const hash = await hashPassword("secret", salt);
    const ok = await verifyPassword("wrong", salt, hash);
    expect(ok).toBe(false);
  });

  it("should_generate_hex_salt_of_32_chars", () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should_generate_uuid_like_session_token", () => {
    const token = generateSessionToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

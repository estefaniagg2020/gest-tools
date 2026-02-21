import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("should show login page with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /iniciar sesión|log in|anmelden|iniciar sessió/i })).toBeVisible();
    await expect(page.locator("#login-username")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|enter|anmelden/i })).toBeVisible();
  });

  test("should have username and password inputs fillable", async ({ page }) => {
    await page.goto("/login");
    const username = page.locator("#login-username");
    const password = page.locator("#login-password");
    await expect(username).toBeVisible();
    await expect(password).toBeVisible();
    await username.fill("test");
    await password.fill("test");
    await expect(username).toHaveValue("test");
    await expect(password).toHaveValue("test");
  });

  test("should stay on login when submitting empty", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /entrar|enter|anmelden/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

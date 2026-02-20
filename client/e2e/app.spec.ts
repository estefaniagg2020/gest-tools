import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("should load and show login or dashboard", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { name: /iniciar sesión|log in|dashboard|panel/i });
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test("should navigate to forgot-password from login", async ({ page }) => {
    await page.goto("/login");
    const forgotLink = page.getByRole("link", { name: /olvidado|forgot|contraseña|password/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test("should have login form when on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator("#login-username")).toBeVisible();
  });
});

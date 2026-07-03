import { test, expect } from "@playwright/test";

test.describe("authentication", () => {
  test("rejects an invalid password", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.locator("#email").fill("admin@example.com");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "Invalid email or password." })).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("redirects an unauthenticated visitor to sign in", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/auth/signin**");
    await expect(page).toHaveURL(/callbackUrl=/);
  });

  test("signs in and then signs out", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.locator("#email").fill("admin@example.com");
    await page.locator("#password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/admin");

    await page.getByRole("button", { name: "Sign out" }).first().click();
    await page.waitForURL("**/auth/signin");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});

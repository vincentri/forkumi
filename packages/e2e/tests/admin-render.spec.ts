import { test, expect } from "@playwright/test";

test.describe("admin UI renders", () => {
  test("dashboard shell + nav + signed-in email", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "admin@example.com" })).toBeVisible();
  });

  test("user list shows the seeded admin row", async ({ page }) => {
    await page.goto("/admin/user");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "admin@example.com" })).toBeVisible();
  });

  test("role list shows the seeded roles", async ({ page }) => {
    await page.goto("/admin/role");
    await expect(page.getByRole("heading", { name: "Roles" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "super admin" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "viewer" })).toBeVisible();
  });
});

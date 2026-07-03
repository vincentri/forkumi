import { test, expect } from "@playwright/test";

test.describe("role management", () => {
  test("creates a role with a permission", async ({ page }) => {
    await page.goto("/admin/role");
    await page.getByRole("button", { name: "+ New Role" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Role Name").fill("editor");
    // Permissions render as a model:action matrix; grant a single concrete cell.
    await dialog.locator('input[id="permissions-user:view"]').check();
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByRole("cell", { name: "editor", exact: true })).toBeVisible();
  });

  test("protected super admin role offers no delete; viewer does", async ({ page }) => {
    await page.goto("/admin/role");

    // Protected role: guard removes the Delete action.
    const protectedRow = page.getByRole("row").filter({ hasText: "super admin" });
    await protectedRow.getByRole("button").last().click();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveCount(0);
    await page.keyboard.press("Escape");

    // Non-protected role: Delete is available (proves the guard is row-specific).
    const viewerRow = page.getByRole("row").filter({ hasText: "viewer" });
    await viewerRow.getByRole("button").last().click();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();
  });
});

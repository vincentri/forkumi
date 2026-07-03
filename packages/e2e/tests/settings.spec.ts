import { test, expect } from "@playwright/test";
import {
  saveKeyValuePage,
  switchTab,
} from "../helpers/crud";

test.describe("Settings (keyValue)", () => {
  let appNameBefore: string;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/settings");
    appNameBefore = await page.getByLabel("App Name").inputValue();
  });

  test.afterEach(async ({ page }) => {
    // Always navigate back to Branding tab first — some tests switch to
    // Email which hides the App Name field.
    await switchTab(page, "Branding");
    const current = await page.getByLabel("App Name").inputValue();
    if (current !== appNameBefore) {
      await page.getByLabel("App Name").fill(appNameBefore);
      await saveKeyValuePage(page);
    }
  });

  test("page renders with Branding tab", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Branding" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Email" })).toBeVisible();
  });

  test("branding fields show seeded values", async ({ page }) => {
    await expect(page.getByLabel("App Name")).toHaveValue("Quantyx");
  });

  test("edit app name and save", async ({ page }) => {
    const appNameInput = page.getByLabel("App Name");
    await appNameInput.clear();
    await appNameInput.fill("My Test App");
    await saveKeyValuePage(page);
    await expect(page.getByLabel("App Name")).toHaveValue("My Test App");
  });

  test("saving empty app name does not crash", async ({ page }) => {
    const appNameInput = page.getByLabel("App Name");
    await appNameInput.clear();
    await saveKeyValuePage(page);
    // The form accepts empty values — verify the page is still functional
    // (heading still visible, no crash)
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });

  test("switch to Email tab", async ({ page }) => {
    await switchTab(page, "Email");
    await expect(page.getByLabel("Enable email delivery")).toBeVisible();
  });

  test("toggle email enabled shows conditional fields", async ({ page }) => {
    await switchTab(page, "Email");
    const emailEnabled = page.getByLabel("Enable email delivery");
    if (!(await emailEnabled.isChecked())) {
      await emailEnabled.check();
      await expect(page.getByLabel("From Email")).toBeVisible();
      await expect(page.getByLabel("From Name")).toBeVisible();
      await emailEnabled.uncheck();
    }
  });
});

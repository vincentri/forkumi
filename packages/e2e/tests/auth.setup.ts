import { test as setup, expect } from "@playwright/test";
import { resolve } from "node:path";
import { REPO_ROOT } from "../lib/paths";

const authFile = resolve(REPO_ROOT, "packages", "e2e", ".auth", "admin.json");

/**
 * Logs in once as the seeded admin and persists the session so the logged-in
 * project can reuse it (Playwright's recommended auth pattern).
 */
setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/signin");
  await page.locator("#email").fill("admin@example.com");
  await page.locator("#password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/admin");
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();

  await page.context().storageState({ path: authFile });
});

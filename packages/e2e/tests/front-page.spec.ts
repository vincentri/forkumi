import { test, expect } from "@playwright/test";
import {
  saveKeyValuePage,
  switchTab,
} from "../helpers/crud";

test.describe("Front Page Settings (keyValue)", () => {
  let siteNameBefore: string;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/front-page-settings");
    siteNameBefore = await page.getByLabel("Site Name").inputValue();
  });

  test.afterEach(async ({ page }) => {
    // Always navigate back to General tab first — some tests switch to
    // other tabs which hide the Site Name field.
    await switchTab(page, "General");
    const current = await page.getByLabel("Site Name").inputValue();
    if (current !== siteNameBefore) {
      await page.getByLabel("Site Name").fill(siteNameBefore);
      await saveKeyValuePage(page);
    }
  });

  test("page renders with tabs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /front page/i }).or(page.getByRole("heading", { name: /settings/i }))).toBeVisible();
    await expect(page.getByRole("tab").first()).toBeVisible();
  });

  test("General tab shows site name field", async ({ page }) => {
    const siteName = page.getByLabel("Site Name");
    await expect(siteName).toBeVisible();
  });

  test("edit site name and save", async ({ page }) => {
    const siteName = page.getByLabel("Site Name");
    await siteName.clear();
    await siteName.fill("Test Site");
    await saveKeyValuePage(page);
    await expect(page.getByLabel("Site Name")).toHaveValue("Test Site");
  });

  test("switch to SEO tab", async ({ page }) => {
    await switchTab(page, "SEO");
    await expect(page.getByLabel("Meta Title")).toBeVisible();
    await expect(page.getByLabel("Meta Description")).toBeVisible();
  });

  test("switch to Home Page tab", async ({ page }) => {
    await switchTab(page, "Home Page");
    await expect(page.getByLabel("Feedback Section Title")).toBeVisible();
  });

  test("switch to Social Media tab", async ({ page }) => {
    await switchTab(page, "Social Media");
    await expect(page.getByLabel("Instagram")).toBeVisible();
  });

  test("switch to Scripts tab and edit", async ({ page }) => {
    await switchTab(page, "Scripts");
    const headerScript = page.getByLabel("Header Script");
    await expect(headerScript).toBeVisible();
    await headerScript.clear();
    await headerScript.fill("<script>console.log('test')</script>");
    await saveKeyValuePage(page);
    await expect(headerScript).toHaveValue("<script>console.log('test')</script>");
    // Reset scripts to empty — no seeded default exists
    await headerScript.clear();
    await saveKeyValuePage(page);
  });
});

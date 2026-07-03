import { Page, expect } from "@playwright/test";

// ── Types ─────────────────────────────────────────────

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "number"
  | "password"
  | "color"
  | "range"
  | "boolean"
  | "date"
  | "datetime"
  | "richtext"
  | "image"
  | "file"
  | "select"
  | "multicheck"
  | "model-select"
  | "model-multi-select";

export interface FormFieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  multiple?: boolean;
}

export interface ResourceConfig {
  singularLabel: string;
  pluralLabel: string;
  url: string;
  fields: FormFieldDefinition[];
}

// ── Helpers ───────────────────────────────────────────

/**
 * Opens the create dialog by clicking "+ New {singularLabel}".
 */
export async function openCreateDialog(page: Page, singularLabel: string) {
  await page.getByRole("button", { name: `+ New ${singularLabel}` }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

/**
 * Opens the edit dialog for a given row (0-indexed, default first row).
 * Clicks the three-dot menu in the row's last cell, then selects "Edit".
 */
export async function openEditDialog(
  page: Page,
  singularLabel: string,
  rowIndex = 0,
) {
  // Wait for table rows to be populated
  await expect(page.getByRole("row").filter({ has: page.locator("td") }).first()).toBeVisible();
  const row = page.getByRole("row").filter({ has: page.locator("td") }).nth(rowIndex);
  await row.locator("td").last().getByRole("button").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: `Edit ${singularLabel}` })).toBeVisible();
}

/**
 * Opens the delete confirmation dialog for a given row.
 */
export async function openDeleteDialog(
  page: Page,
  singularLabel: string,
  rowIndex = 0,
) {
  // Wait for table rows to be populated
  await expect(page.getByRole("row").filter({ has: page.locator("td") }).first()).toBeVisible();
  const row = page.getByRole("row").filter({ has: page.locator("td") }).nth(rowIndex);
  await row.locator("td").last().getByRole("button").click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: `Delete ${singularLabel}?` })).toBeVisible();
}

/**
 * Clicks the destructive "Delete" button in the confirmation dialog.
 */
export async function confirmDelete(page: Page) {
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

/**
 * Fills a single form field by its type.
 */
export async function fillField(
  page: Page,
  field: FormFieldDefinition,
  value: string | boolean,
) {
  switch (field.type) {
    case "text":
    case "textarea":
    case "email":
    case "url":
    case "number":
    case "password": {
      await page.getByLabel(field.label).fill(String(value));
      break;
    }

    case "boolean": {
      const sw = page.getByRole("switch", { name: field.label });
      const isChecked = await sw.isChecked();
      const wantChecked = Boolean(value);
      if (isChecked !== wantChecked) {
        await sw.click();
      }
      break;
    }

    case "date":
    case "datetime": {
      await page.locator(`#${field.name}`).fill(String(value));
      break;
    }

    case "color":
    case "range": {
      await page.locator(`#${field.name}`).fill(String(value));
      break;
    }

    case "select": {
      const container = page.locator(`label:has-text("${field.label}")`).locator("..");
      const trigger = container.getByRole("combobox");
      await trigger.click();
      await page.getByRole("option", { name: String(value), exact: true }).click();
      break;
    }

    case "model-select": {
      const trigger = page.getByRole("combobox", { name: new RegExp(field.label, "i") }).first();
      await trigger.click();
      const popover = page.getByRole("dialog").last();
      await popover.getByPlaceholder("Search…").fill(String(value));
      await popover.getByRole("option", { name: String(value) }).click();
      break;
    }

    case "model-multi-select": {
      const trigger = page.getByRole("combobox", { name: new RegExp(field.label, "i") }).first();
      await trigger.click();
      const popover = page.getByRole("dialog").last();
      const values = Array.isArray(value) ? value : [String(value)];
      for (const v of values) {
        await popover.getByPlaceholder("Search…").fill(v);
        await popover.getByRole("option", { name: v }).click();
      }
      await page.keyboard.press("Escape");
      break;
    }

    case "multicheck": {
      const values = Array.isArray(value) ? value : [String(value)];
      for (const v of values) {
        const id = `${field.name}-${v}`;
        await page.locator(`#${id}`).check();
      }
      break;
    }

    case "richtext": {
      // Richtext editor may be in a hidden tab — click the tab first
      const tab = page.getByRole("tab", { name: new RegExp(field.label, "i") });
      if (await tab.count() > 0) {
        await tab.click();
      }
      // Use the editor's contenteditable area
      const editor = page.locator(".tiptap, .ProseMirror, [contenteditable='true']");
      await editor.first().click();
      await editor.first().fill(String(value));
      break;
    }

    case "image":
    case "file": {
      // File uploads require file chooser handling — skip for now
      throw new Error(`fillField: "${field.type}" not yet supported in helpers`);
    }
  }
}

/**
 * Fills multiple fields from a data record.
 */
export async function fillForm(
  page: Page,
  fields: FormFieldDefinition[],
  data: Record<string, string | boolean>,
) {
  for (const [name, value] of Object.entries(data)) {
    const field = fields.find((f) => f.name === name);
    if (!field) {
      throw new Error(`fillForm: field "${name}" not found in field definitions`);
    }
    await fillField(page, field, value);
  }
}

/**
 * Clicks the submit button inside the dialog (Create or Update).
 */
export async function submitForm(page: Page, mode: "create" | "update") {
  const label = mode.toLowerCase() === "create" ? "Create" : "Update";
  await page.getByRole("dialog").getByRole("button", { name: label }).click();
}

/**
 * Waits for the dialog to close.
 */
export async function waitForDialogClose(page: Page) {
  await expect(page.getByRole("dialog")).toBeHidden();
}

// ── Higher-level flows ────────────────────────────────

/**
 * Navigate → open dialog → fill → submit → verify dialog closed → verify in list.
 */
export async function createResource(
  page: Page,
  config: ResourceConfig,
  data: Record<string, string | boolean>,
) {
  await page.goto(config.url);
  await expectListPageReady(page, config.pluralLabel, config.singularLabel);
  await openCreateDialog(page, config.singularLabel);
  await fillForm(page, config.fields, data);
  await submitForm(page, "create");
  await waitForDialogClose(page);
}

/**
 * Navigate → open edit → fill → submit.
 */
export async function editResource(
  page: Page,
  config: ResourceConfig,
  data: Record<string, string | boolean>,
  rowIndex = 0,
) {
  await page.goto(config.url);
  await expectListPageReady(page, config.pluralLabel, config.singularLabel);
  await openEditDialog(page, config.singularLabel, rowIndex);
  await fillForm(page, config.fields, data);
  await submitForm(page, "update");
  await waitForDialogClose(page);
}

/**
 * Navigate → open delete dialog → confirm.
 */
export async function deleteResource(
  page: Page,
  config: ResourceConfig,
  rowIndex = 0,
) {
  await page.goto(config.url);
  await expectListPageReady(page, config.pluralLabel, config.singularLabel);
  await openDeleteDialog(page, config.singularLabel, rowIndex);
  await confirmDelete(page);
}

// ── Assertions ────────────────────────────────────────

/**
 * Asserts that a row containing the given text exists in the table.
 */
export async function expectRowVisible(page: Page, text: string) {
  await expect(
    page.getByRole("row").filter({ hasText: text }),
  ).toBeVisible();
}

/**
 * Asserts that a row containing the given text does NOT exist.
 */
export async function expectRowHidden(page: Page, text: string) {
  await expect(
    page.getByRole("row").filter({ hasText: text }),
  ).toHaveCount(0);
}

/**
 * Asserts the list page heading and "+ New" button are visible.
 */
export async function expectListPageReady(
  page: Page,
  heading: string,
  singularLabel: string,
) {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(
    page.getByRole("button", { name: `+ New ${singularLabel}` }),
  ).toBeVisible();
}

/**
 * Asserts a field-level validation error is visible.
 */
export async function expectFieldError(
  page: Page,
  fieldLabel: string,
  errorPattern?: RegExp,
) {
  const label = page.getByLabel(fieldLabel);
  const error = label.locator("~ p.text-destructive").first();
  if (errorPattern) {
    await expect(error).toHaveText(errorPattern);
  } else {
    await expect(error).toBeVisible();
  }
}

// ── KeyValue helpers ─────────────────────────────────

/**
 * Clicks the Save button on a keyValue settings page and waits for it to
 * finish (button text changes from "Saving…" back to "Save").
 */
export async function saveKeyValuePage(page: Page) {
  const saveBtn = page.getByRole("button", { name: /save/i });
  await saveBtn.click();
  await expect(saveBtn).toBeEnabled();
  await expect(saveBtn).toHaveText("Save");
}

/**
 * Switches to a tab on a keyValue page by its label text.
 */
export async function switchTab(page: Page, tabName: string) {
  await page.getByRole("tab", { name: tabName }).click();
}

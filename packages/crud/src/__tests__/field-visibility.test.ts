import { describe, expect, it } from "vitest";
import { isFieldVisible, visibleFieldsForValues } from "../field-visibility";
import type { CRUDField } from "../types";

const baseField: CRUDField = {
  name: "emailSesRegion",
  type: "text",
  label: "SES Region",
};

describe("field visibility", () => {
  it("shows fields without visibleWhen", () => {
    expect(isFieldVisible(baseField, {})).toBe(true);
  });

  it("supports equals conditions", () => {
    const field: CRUDField = {
      ...baseField,
      visibleWhen: { field: "emailProvider", equals: "ses" },
    };

    expect(isFieldVisible(field, { emailProvider: "ses" })).toBe(true);
    expect(isFieldVisible(field, { emailProvider: "resend" })).toBe(false);
  });

  it("supports in conditions", () => {
    const field: CRUDField = {
      ...baseField,
      visibleWhen: { field: "emailProvider", in: ["ses", "smtp"] },
    };

    expect(isFieldVisible(field, { emailProvider: "smtp" })).toBe(true);
    expect(isFieldVisible(field, { emailProvider: "resend" })).toBe(false);
  });

  it("filters to visible fields", () => {
    const fields: CRUDField[] = [
      { name: "emailProvider", type: "select", label: "Provider" },
      { ...baseField, visibleWhen: { field: "emailProvider", equals: "ses" } },
    ];

    expect(visibleFieldsForValues(fields, { emailProvider: "resend" }).map((field) => field.name)).toEqual([
      "emailProvider",
    ]);
  });
});

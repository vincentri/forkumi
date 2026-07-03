// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FieldRenderer } from "../components/fields/FieldRenderer";
import type { CRUDField } from "../types";

function TestWrapper({
  field,
  readOnly,
}: {
  field: CRUDField;
  readOnly?: boolean;
}) {
  const { register, watch, control } = useForm({
    defaultValues: { [field.name]: "" },
  });
  return (
    <FieldRenderer
      field={field}
      register={register}
      watch={watch}
      control={control}
      readOnly={readOnly}
    />
  );
}

describe("FieldRenderer", () => {
  it("renders TextInputField for text type", () => {
    const field: CRUDField = { name: "title", type: "text", label: "Title" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
  });

  it("renders TextInputField for number type", () => {
    const field: CRUDField = { name: "count", type: "number", label: "Count" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Count")).toBeInTheDocument();
  });

  it("renders TextInputField for email type", () => {
    const field: CRUDField = { name: "email", type: "email", label: "Email" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("renders TextInputField for url type", () => {
    const field: CRUDField = { name: "website", type: "url", label: "Website" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Website")).toBeInTheDocument();
  });

  it("renders TextInputField for date type", () => {
    const field: CRUDField = { name: "createdAt", type: "date", label: "Created" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Created")).toBeInTheDocument();
  });

  it("renders TextInputField for password type", () => {
    const field: CRUDField = { name: "secret", type: "password", label: "Secret" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Secret")).toBeInTheDocument();
  });

  it("renders TextareaField for textarea type", () => {
    const field: CRUDField = { name: "bio", type: "textarea", label: "Bio" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText("Bio")).toBeInTheDocument();
  });

  it("renders ColorField for color type", () => {
    const field: CRUDField = { name: "favColor", type: "color", label: "Favorite Color" };
    const { container } = render(<TestWrapper field={field} />);
    expect(container.querySelector('input[type="color"]')).toBeInTheDocument();
  });

  it("renders DateTimeField for datetime type", () => {
    const field: CRUDField = { name: "date", type: "datetime", label: "Date" };
    render(<TestWrapper field={field} />);
    expect(screen.getByPlaceholderText(/date/i)).toBeInTheDocument();
  });

  it("passes readOnly to datetime field", () => {
    const field: CRUDField = { name: "date", type: "datetime", label: "Date" };
    render(<TestWrapper field={field} readOnly />);
    const input = screen.getByPlaceholderText(/date/i);
    expect(input).toBeDisabled();
  });

  it("renders BooleanField as Switch for boolean type", () => {
    const field: CRUDField = { name: "active", type: "boolean", label: "Active" };
    const { container } = render(<TestWrapper field={field} />);
    const switchEl = container.querySelector('[role="switch"]');
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("id", "active");
  });

  it("renders SelectField for select type with static options", () => {
    const field: CRUDField = {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
    };
    render(<TestWrapper field={field} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders MulticheckField for multicheck type", () => {
    const field: CRUDField = {
      name: "tags",
      type: "multicheck",
      label: "Tags",
      options: [
        { value: "tech", label: "Technology" },
        { value: "design", label: "Design" },
      ],
    };
    render(<TestWrapper field={field} />);
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });
});

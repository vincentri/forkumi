import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CRUDForm } from "../components/CRUDForm";
import type { CRUDConfig } from "../types";

const config: CRUDConfig = {
  model: "product",
  label: "Products",
  fields: [
    { name: "title", type: "text", label: "Title", required: true },
    { name: "price", type: "number", label: "Price", required: true },
    { name: "notes", type: "textarea", label: "Notes" },
  ],
};

describe("CRUDForm", () => {
  it("renders labels for all fields", () => {
    render(<CRUDForm config={config} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("marks required fields with asterisk", () => {
    render(<CRUDForm config={config} onSubmit={vi.fn()} />);
    // required fields have a * span next to their label
    const titleLabel = screen.getByText("Title");
    expect(titleLabel.parentElement).toHaveTextContent("*");
  });

  it("shows validation error when required field is empty on submit", async () => {
    render(<CRUDForm config={config} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with form data when valid", async () => {
    const onSubmit = vi.fn();
    const textConfig: CRUDConfig = {
      model: "note",
      label: "Notes",
      fields: [
        { name: "title", type: "text", label: "Title", required: true },
      ],
    };
    const { container } = render(<CRUDForm config={textConfig} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/title/i), "Test Product");
    // Use fireEvent.submit directly on the form to bypass jsdom button click quirks
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Product" }),
      );
    });
  });

  it("pre-fills defaultValues", () => {
    render(
      <CRUDForm
        config={config}
        onSubmit={vi.fn()}
        defaultValues={{ title: "Prefilled", price: 42 }}
      />,
    );
    expect(screen.getByLabelText(/title/i)).toHaveValue("Prefilled");
  });

  it("shows custom submit label", () => {
    render(<CRUDForm config={config} onSubmit={vi.fn()} submitLabel="Create" />);
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("disables submit button when isLoading", () => {
    render(<CRUDForm config={config} onSubmit={vi.fn()} isLoading />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveTextContent(/saving/i);
  });
});

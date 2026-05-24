import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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

  it("keeps default single-column rendering when formLayout is undefined", () => {
    const { container } = render(<CRUDForm config={config} onSubmit={vi.fn()} />);
    expect(container.querySelector("[data-layout-section]")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it("renders multiple formLayout sections in order", () => {
    const layoutConfig: CRUDConfig = {
      model: "post",
      label: "Posts",
      formLayout: [
        { section: "Meta", rows: [["slug"]] },
        { section: "Content", rows: [["body"]] },
      ],
      fields: [
        { name: "slug", type: "text", label: "Slug" },
        { name: "body", type: "textarea", label: "Body" },
      ],
    };
    const { container } = render(<CRUDForm config={layoutConfig} onSubmit={vi.fn()} />);
    const headings = Array.from(container.querySelectorAll("h3")).map((heading) => heading.textContent);
    expect(headings).toEqual(["Meta", "Content"]);
  });

  it("renders columns and stacked rows inside a section", () => {
    const layoutConfig: CRUDConfig = {
      model: "post",
      label: "Posts",
      formLayout: [
        {
          section: "Meta",
          columns: [
            { rows: [["slug"], ["title", "tag"]] },
            { rows: [["categoryId"]] },
          ],
        },
      ],
      fields: [
        { name: "slug", type: "text", label: "Slug" },
        { name: "title", type: "text", label: "Title" },
        { name: "tag", type: "text", label: "Tag" },
        { name: "categoryId", type: "text", label: "Category" },
      ],
    };
    const { container } = render(<CRUDForm config={layoutConfig} onSubmit={vi.fn()} />);
    const columnsGrid = container.querySelector("[data-layout-columns]");
    expect(columnsGrid).toHaveClass("md:grid-cols-2");

    const columns = container.querySelectorAll("[data-layout-column]");
    expect(columns).toHaveLength(2);
    expect(within(columns[0] as HTMLElement).getByLabelText(/slug/i)).toBeInTheDocument();
    expect(within(columns[0] as HTMLElement).getByLabelText(/title/i)).toBeInTheDocument();
    expect(within(columns[0] as HTMLElement).getByLabelText(/tag/i)).toBeInTheDocument();
    expect(within(columns[1] as HTMLElement).getByLabelText(/category/i)).toBeInTheDocument();
  });

  it("renders row fields side-by-side and supports object span", () => {
    const layoutConfig: CRUDConfig = {
      model: "post",
      label: "Posts",
      formLayout: [
        {
          section: "Publishing",
          rows: [
            ["status", "published"],
            [{ field: "publishedAt", span: 2 }],
          ],
        },
      ],
      fields: [
        { name: "status", type: "text", label: "Status" },
        { name: "published", type: "text", label: "Published" },
        { name: "publishedAt", type: "text", label: "Publish Date" },
      ],
    };
    const { container } = render(<CRUDForm config={layoutConfig} onSubmit={vi.fn()} />);
    const rows = container.querySelectorAll("[data-layout-row]");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveClass("md:grid-cols-2");
    expect(rows[1]).toHaveClass("md:grid-cols-2");

    const publishDateField = screen.getByLabelText(/publish date/i);
    expect(publishDateField.closest(".space-y-1\\.5")?.parentElement).toHaveClass("md:col-span-2");
  });

  it("appends unreferenced fields and ignores unknown layout field names", () => {
    const layoutConfig: CRUDConfig = {
      model: "post",
      label: "Posts",
      formLayout: [
        { section: "Meta", rows: [["slug", "missingField"]] },
      ],
      fields: [
        { name: "slug", type: "text", label: "Slug" },
        { name: "notes", type: "textarea", label: "Notes" },
      ],
    };
    const { container } = render(<CRUDForm config={layoutConfig} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/missing field/i)).not.toBeInTheDocument();

    const unreferenced = container.querySelector("[data-layout-unreferenced]");
    expect(unreferenced).toBeInTheDocument();
    expect(within(unreferenced as HTMLElement).getByLabelText(/notes/i)).toBeInTheDocument();
  });
});

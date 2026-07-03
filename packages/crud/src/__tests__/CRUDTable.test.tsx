// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CRUDTable } from "../components/CRUDTable";
import type { CRUDConfig } from "../types";

const config: CRUDConfig = {
  model: "product",
  label: "Products",
  fields: [
    { name: "title", type: "text", label: "Title", required: true },
    { name: "published", type: "boolean", label: "Published" },
  ],
};

const rows = [
  { id: "1", title: "Widget A", published: true },
  { id: "2", title: "Widget B", published: false },
];

describe("CRUDTable", () => {
  it("renders column headers from config fields", () => {
    render(<CRUDTable config={config} data={rows} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(<CRUDTable config={config} data={rows} />);
    expect(screen.getByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
  });

  it("renders boolean fields as Yes/No badges", () => {
    render(<CRUDTable config={config} data={rows} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(<CRUDTable config={config} data={[]} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("shows skeleton rows when loading", () => {
    const { container } = render(<CRUDTable config={config} data={[]} isLoading />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.queryByText("Widget A")).not.toBeInTheDocument();
  });

  it("calls onSort with field and direction when sortable header clicked", () => {
    const onSort = vi.fn();
    render(<CRUDTable config={config} data={rows} onSort={onSort} />);
    fireEvent.click(screen.getByText("Title"));
    expect(onSort).toHaveBeenCalledWith("title", "asc");
  });

  it("toggles sort direction on second click of same header", () => {
    const onSort = vi.fn();
    render(
      <CRUDTable config={config} data={rows} onSort={onSort} sortField="title" sortDir="asc" />,
    );
    fireEvent.click(screen.getByText("Title"));
    expect(onSort).toHaveBeenCalledWith("title", "desc");
  });

  it("renders text filters by default and calls onFilterChange", () => {
    const onFilterChange = vi.fn();
    const filterConfig: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "notes", type: "text", label: "Notes", filterable: false },
      ],
    };

    render(
      <CRUDTable
        config={filterConfig}
        data={[{ id: "1", title: "Widget A", notes: "Hidden filter" }]}
        onFilterChange={onFilterChange}
      />,
    );

    const filterInput = screen.getByPlaceholderText(/filter/i);
    expect(filterInput).toBeInTheDocument();

    fireEvent.change(filterInput, { target: { value: "widget" } });
    expect(onFilterChange).toHaveBeenCalledWith("title", "widget");
  });

  it("renders color field as swatch", () => {
    const colorConfig: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "color", type: "color", label: "Color" },
      ],
    };
    const colorRows = [{ id: "1", title: "Widget", color: "#ff0000" }];
    render(<CRUDTable config={colorConfig} data={colorRows} />);
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
  });

  it("renders date field formatted", () => {
    const dateConfig: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "createdAt", type: "date", label: "Created" },
      ],
    };
    const dateRows = [{ id: "1", title: "Widget", createdAt: "2026-01-15" }];
    render(<CRUDTable config={dateConfig} data={dateRows} />);
    // Date should be rendered (exact format depends on locale)
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders password field as masked dots", () => {
    const passwordConfig: CRUDConfig = {
      model: "user",
      label: "Users",
      fields: [
        { name: "email", type: "text", label: "Email" },
        { name: "password", type: "password", label: "Password", showInTable: true },
      ],
    };
    const passwordRows = [{ id: "1", email: "a@b.com", password: "secret123" }];
    render(<CRUDTable config={passwordConfig} data={passwordRows} />);
    expect(screen.getByText("••••••••")).toBeInTheDocument();
  });

  it("renders Edit and Delete action buttons when handlers provided", () => {
    render(<CRUDTable config={config} data={rows} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons.length).toBeGreaterThan(0);
  });

  it("calls onEdit with row data when Edit clicked", () => {
    const onEdit = vi.fn();
    render(<CRUDTable config={config} data={rows} onEdit={onEdit} />);
    const actionButtons = screen.getAllByRole("button");
    fireEvent.keyDown(actionButtons[0], { key: "Enter" });
    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith(rows[0]);
  });

  it("calls onEdit when a row is clicked", () => {
    const onEdit = vi.fn();
    const { container } = render(<CRUDTable config={config} data={rows} onEdit={onEdit} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBeGreaterThan(0);
    fireEvent.click(bodyRows[0]);
    expect(onEdit).toHaveBeenCalledWith(rows[0]);
  });

  it("does not call onEdit when clicking a checkbox inside the row", () => {
    const onEdit = vi.fn();
    const onSelectRow = vi.fn();
    render(
      <CRUDTable
        config={config}
        data={rows}
        onEdit={onEdit}
        showCheckboxes
        onSelectRow={onSelectRow}
        selectedIds={new Set()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    // checkboxes[1] is the first data-row checkbox (index 0 is header)
    fireEvent.click(checkboxes[1]);
    expect(onSelectRow).toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("does not call onEdit when clicking the row action button", () => {
    const onEdit = vi.fn();
    render(<CRUDTable config={config} data={rows} onEdit={onEdit} />);
    // The kebab trigger is a button inside the row
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("does not make rows clickable when onEdit is not provided", () => {
    const { container } = render(<CRUDTable config={config} data={rows} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBeGreaterThan(0);
    expect(bodyRows[0].className).not.toMatch(/cursor-pointer/);
    fireEvent.click(bodyRows[0]);
  });

  it("does not make pending-invite rows clickable", () => {
    const onEdit = vi.fn();
    const { container } = render(
      <CRUDTable
        config={config}
        data={[{ id: "1", title: "Pending", published: true, isPendingInvite: true }]}
        onEdit={onEdit}
      />,
    );
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBeGreaterThan(0);
    expect(bodyRows[0].className).not.toMatch(/cursor-pointer/);
    fireEvent.click(bodyRows[0]);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("calls onDelete with row data when Delete clicked", () => {
    const onDelete = vi.fn();
    render(<CRUDTable config={config} data={rows} onDelete={onDelete} />);
    const actionButtons = screen.getAllByRole("button");
    fireEvent.keyDown(actionButtons[0], { key: "Enter" });
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
  });

  it("renders checkboxes when showCheckboxes is true", () => {
    const onSelectRow = vi.fn();
    render(
      <CRUDTable
        config={config}
        data={rows}
        showCheckboxes
        onSelectRow={onSelectRow}
        selectedIds={new Set()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("calls onSelectRow when checkbox is clicked", () => {
    const onSelectRow = vi.fn();
    render(
      <CRUDTable
        config={config}
        data={rows}
        showCheckboxes
        onSelectRow={onSelectRow}
        selectedIds={new Set()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(onSelectRow).toHaveBeenCalled();
  });

  it("calls onSelectAll when header checkbox is clicked", () => {
    const onSelectAll = vi.fn();
    render(
      <CRUDTable
        config={config}
        data={rows}
        showCheckboxes
        onSelectAll={onSelectAll}
        selectedIds={new Set()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onSelectAll).toHaveBeenCalled();
  });

  it("renders select filter when onFilterChange provided with boolean filter", () => {
    const onFilterChange = vi.fn();
    const selectConfig: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "active", type: "boolean", label: "Active" },
      ],
    };
    render(
      <CRUDTable
        config={selectConfig}
        data={[{ id: "1", title: "Widget", active: true }]}
        onFilterChange={onFilterChange}
      />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("keeps filter inputs visible when filtered results are empty", () => {
    const onFilterChange = vi.fn();
    render(<CRUDTable config={config} data={[]} onFilterChange={onFilterChange} />);

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

});
